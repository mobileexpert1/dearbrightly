import logging
import requests
import xmltodict
from datetime import timedelta

from urllib.parse import urlencode
from typing import Dict
from mail.services import MailService

from rest_framework import status
from rest_framework.response import Response

from django.utils import timezone
from django.conf import settings
from django.db.models import Q, QuerySet
from orders.models import Order, OrderItem, OrderProduct

logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
logger = logging.getLogger(__name__)

CA_WAREHOUSE_STATES = [
	"AZ", # state not supported
    "CA",
    "CO",
	"ID", # state not supported
    "OR",
    "MT",
	"NV", # state not supported
    "UT",
    "WA"
]

class SupplyChainService:

	def submit_order_smart_warehouse(self, order: Order):
		if order.smart_warehouse_submit_datetime:
			error_msg = f"Order {order.id} already submitted to smart warehouse."
			logger.error(f"[SupplyChainService][submit_order_smart_warehouse] {error_msg}")
			return Response(data=error_msg, status=status.HTTP_400_BAD_REQUEST)

		order_items = order.order_items.filter(product__smart_warehouse_sku__isnull=False)

		if not order_items:
			error_msg = f"No products in order {order.id} available at warehouse."
			logger.error(f"[SupplyChainService][submit_order_smart_warehouse] {error_msg}")
			return Response(data=error_msg, status=status.HTTP_400_BAD_REQUEST)

		try:
			order_params = {
				"ct": 2,
				"method": 1,
				"stname": order.customer.get_full_name(),
				"staddr": order.shipping_details.get_address_line(),
				"stcity": order.shipping_details.city,
				"ststate": order.shipping_details.state,
				"stzip": order.shipping_details.postal_code,
				"stcountry": "USA",
				"stphone": order.shipping_details.phone,
				"licount": len(order_items), # match the number of instances of the ‘sku’ parameter
				"cr1": order.id,
				"method": 30,
				"dedupe": 1,
				"dedupe_field": "cr1"
			}

			state = "ca" #if order.shipping_details.state in CA_WAREHOUSE_STATES else "ks"
			query_string = self._get_authentication_query_string(state=state) + \
						   "&" + \
						   urlencode(order_params) + \
						   self._get_sku_and_quantity_query_string(order_items)

			response = requests.get(query_string)
			data = xmltodict.parse(response.content).get("SmartAPI")
			response_status = data.get("Status")
			errors_string = self._get_error_string(data.get("Errors"))

			logger.debug(f"[SupplyChainService][submit_order_smart_warehouse] "
						 f"order_params: {order_params}. "
						 f"query_string: {query_string}. "
						 f"response: {response}. "
						 f"data: {data}. "
						 f"response_status: {response_status}. "
						 f"errors_string: {errors_string}.")

			if response_status == "Success":
				order.smart_warehouse_submit_datetime = timezone.now()
				if order.is_otc_only():
					order.status = Order.Status.awaiting_fulfillment
					order.save(update_fields=['status', 'smart_warehouse_submit_datetime'])
				else:
					order.save(update_fields=['smart_warehouse_submit_datetime'])
				return Response(status=status.HTTP_200_OK)
		except Exception as error:
			logger.error(f'[SupplyChainService][submit_order_smart_warehouse] Error submitting Smart Warehouse order {order.id}: {error}.')

		logger.error(
			f'[SupplyChainService][submit_order_smart_warehouse] Error submitting Smart Warehouse order {order.id}: {errors_string}.')
		MailService.send_order_notification_email(order,
												  notification_type='SMART WAREHOUSE ORDER SUBMISSION FAILURE',
												  data=errors_string)

		return Response(data=errors_string, status=status.HTTP_400_BAD_REQUEST)

	def update_tracking_info(self, days_before_today=None):
		todays_date = timezone.now()
		days_before_today = days_before_today if days_before_today else 3
		x_days_ago = todays_date - timedelta(days=days_before_today)

		tracking_params = {
			"report" : "tracking",
			"startdate" : x_days_ago.strftime("%Y-%m-%d"),
			"enddate": todays_date.strftime("%Y-%m-%d")
		}

		query_string = self._get_authentication_query_string(state="ca") + \
					   "&" + \
					   urlencode(tracking_params)

		if settings.DEBUG:
			query_string = "https://3d06aab9-67c9-49aa-b444-76e405bc3deb.mock.pstmn.io"

		response = requests.get(query_string)
		data = xmltodict.parse(response.content).get("SmartAPI")
		response_status = data.get("Status")
		errors_string = self._get_error_string(data.get("Errors"))
		orders = data.get("orders")
		order_tracking = orders.get("order_tracking") if orders else None
		logger.debug(f"[SupplyChainService][update_tracking_info] "
					 f"data: {data}.")

		# Use for testing
		#order_tracking = { "cr1" : 292, "package": {"tracking_num": "12345"}}

		if not order_tracking:
			logger.debug(f"[SupplyChainService][update_tracking_info] "
						 f"No order tracking info.")
			return Response(status=status.HTTP_200_OK)

		if not isinstance(order_tracking, list):
			order_tracking = [order_tracking]

		order_items_with_no_tracking = None
		for order_tracking_data in order_tracking:
			logger.debug(f"[SupplyChainService][update_tracking_info] "
						 f"data: {data}. "
						 f"orders: {orders}. "
						 f"order_tracking: {order_tracking}. "
						 f"order_tracking_data: {order_tracking_data}.")
			order_id = order_tracking_data.get("cr1")
			
			try:
				package = order_tracking_data.get("package")
			except AttributeError as error:
				logger.error(f"[SupplyChainService][update_tracking_info] Unable to get package for order {order_id}. Error: {error}.")
				package = None

			tracking_number = package.get("tracking_num") if package else None

			order = Order.objects.filter(id=order_id).first()
			error_order_ids = ""
			if order and tracking_number:
				#logger.debug(f"[SupplyChainService][update_tracking_info] Order: {order_id}")
				smart_warehouse_order_items = OrderItem.objects.filter(Q(order=order) &
																	   Q(product__smart_warehouse_sku__isnull=False))
				is_tracking_number_update = False
				existing_tracking_number = False
				current_time = timezone.now()
				for smart_warehouse_order_item in smart_warehouse_order_items:
					if smart_warehouse_order_item.tracking_number == tracking_number:
						existing_tracking_number = True
						logger.debug(f"[SupplyChainService][update_tracking_info] existing_tracking_number "
									 f"smart_warehouse_order_item: {smart_warehouse_order_item.id}.")
						continue
					is_tracking_number_update = True if smart_warehouse_order_item.tracking_number else False
					smart_warehouse_order_item.shipped_datetime = current_time
					smart_warehouse_order_item.tracking_number = tracking_number
					smart_warehouse_order_item.shipping_carrier = "USPS"
					smart_warehouse_order_item.save(update_fields=["shipping_carrier", "shipped_datetime", "tracking_number"])

					if order.is_all_items_shipped:
						if not order.is_rx_order():
							order.tracking_number = tracking_number
						order.status = Order.Status.shipped
					order.save(update_fields=["status", "tracking_number"])

				if existing_tracking_number:
					logger.debug(f"[SupplyChainService][update_tracking_info] "
								 f"Not sending user shipped email. Existing tracking number for order: {order.id}.")
					continue

				if smart_warehouse_order_items:
					tracking_uri = settings.USPS_TRACKING_URL.format(tracking_number=tracking_number)
					MailService.send_user_shipment_notification(order=order,
																tracking_number=tracking_number,
																tracking_uri=tracking_uri,
																is_update=is_tracking_number_update)
					logger.debug(f"[SupplyChainService][update_tracking_info] "
								 f"Sending user shipped email to {order.customer.email}. Order: {order.id}.")
			else:
				error_order_ids += f"Order: {order_id}. Order trcking data: {order_tracking_data}. "

			if error_order_ids:
				MailService.send_error_notification_email(notification="SMART WAREHOUSE TRACKING ORDER UPDATE ERROR",
														  data=f"Unable to update tracking for order(s): {error_order_ids}")

			logger.debug(f"[SupplyChainService][update_tracking_info] "
						 f"order_tracking: {order_tracking}. "
						 f"order_tracking_data : {order_tracking_data}. "
						 f"order_id: {order_id}. "
						 f"package: {package}. "
						 f"tracking_number: {tracking_number}. order_items_with_no_tracking: {order_items_with_no_tracking}.")

		logger.debug(f"[SupplyChainService][update_tracking_info] "
					 f"tracking_params : {tracking_params}. "
					 f"query_string: {query_string}. "
					 f"response: {response}. "
					 f"data: {data}. "
					 f"orders: {orders}. "
					 f"response_status: {response_status}. "
					 f"errors_string: {errors_string}.")

		if response_status == "Success":
			return Response(status=status.HTTP_200_OK)

		return Response(data=errors_string, status=status.HTTP_400_BAD_REQUEST)

	def get_inventory_data(self, state: str) -> Dict:
		query_string_ca = self._get_authentication_query_string(state=state) + \
					   "&" + \
					   urlencode({"report": "inventory"})

		response = requests.get(query_string_ca)
		data = xmltodict.parse(response.content).get("SmartAPI")
		response_status = data.get("Status")
		errors_string = self._get_error_string(data.get("Errors"))
		inventory = data.get("Inventory")
		items = inventory.get("item") if inventory else None
		sku_quantity = {}

		if not isinstance(items, list):
			items = [items]

		for item in items:
			sku = item.get("sku")
			quantity = item.get("quantity")
			logger.debug(f"[SupplyChainService][get_inventory_data] "
						 f"item: {item}. "
						 f"sku: {sku}. "
						 f"quantity: {quantity}.")
			sku_quantity[sku] = quantity

		logger.debug(f"[SupplyChainService][get_inventory_data] "
					 f"query_string: {query_string_ca}. "
					 f"response: {response}. "
					 f"data: {data}. "
					 f"inventory: {inventory}. "
					 f"items: {items}. "
					 f"sku_quantity: {sku_quantity}.")

		if response_status == "Success":
			return Response(data=sku_quantity, status=status.HTTP_200_OK)

		return Response(data=errors_string, status=status.HTTP_400_BAD_REQUEST)

	def _get_error_string(self, error_data: Dict):
		errors_string = ""
		if error_data:
			errors = dict(error_data)
			for error_value in errors.values():
				errors_string += error_value + ". "
			errors_string = errors_string[:-1] if errors_string else errors_string
		return errors_string

	def _get_sku_and_quantity_query_string(self, order_items: QuerySet) -> str:
		sku_and_quantity_query_string = ""
		sku_and_quantity = {}

		for order_item in order_items:
			sku_and_quantity_query_string += "&"
			sku_and_quantity["sku"] = order_item.product.smart_warehouse_sku
			sku_and_quantity["qty"] = order_item.order_product.quantity
			sku_and_quantity_query_string += urlencode(sku_and_quantity)

			if order_item.product.smart_warehouse_sku == "DB2017A009":
				sku_and_quantity_query_string += "&"
				sku_and_quantity["sku"] = "DB2017A0010"
				sku_and_quantity["qty"] = 1
				sku_and_quantity_query_string += urlencode(sku_and_quantity)

			if order_item.product.smart_warehouse_sku == "DB2017A0007 - Empty bottle":
				sku_and_quantity_query_string += "&"
				sku_and_quantity["sku"] = "DB2017A0007"
				sku_and_quantity["qty"] = 1
				sku_and_quantity_query_string += urlencode(sku_and_quantity)

			logger.debug(f"[SupplyChainService][_get_sku_and_quantity_query_string] "
						 f"order_items: {order_items}. "
						 f"sku_and_quantity_query_string: {sku_and_quantity_query_string}. "
						 f"sku_and_quantity: {sku_and_quantity}.")
		logger.debug(f"[SupplyChainService][_get_sku_and_quantity_query_string] "
					 f"**sku_and_quantity_query_string: {sku_and_quantity_query_string}.")
		return sku_and_quantity_query_string

	def _get_username(self, state: str) -> str:
		state = state.lower()
		if state == "ca":
			return settings.SWIMS_USERNAME_CA
		elif state == "ks":
			return settings.SWIMS_USERNAME_KS
		elif state == "ca_dist":
			return settings.SWIMS_USERNAME_CA_DIST
		else:
			return None

	def _get_cust_id(self, state: str) -> str:
		state = state.lower()
		if state == "ca":
			return settings.SWIMS_CUSTOMER_ID_CA
		elif state == "ks":
			return settings.SWIMS_CUSTOMER_ID_KS
		elif state == "ca_dist":
			return settings.SWIMS_CUSTOMER_ID_CA_DIST
		else:
			return None

	def _get_authentication_query_string(self, state: str) -> str:
		cust_id = self._get_cust_id(state)
		username = self._get_username(state)
		auth_params = {
			"cust_id": cust_id,
			"username": username,
			"password": settings.SWIMS_PASSWORD
		}
		query_string = settings.SWIMS_URL + \
					   "?" + \
					   urlencode(auth_params)
		return query_string