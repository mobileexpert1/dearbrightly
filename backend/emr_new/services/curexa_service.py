import base64
from enum import Enum
import json
from typing import Dict, List, Tuple

import requests
from django.conf import settings
from django.db.models import Q
from rest_framework import status
from rest_framework.response import Response

from emr.models import Visit, PatientPrescription
from emr_new.serializers import (
    CurexaOrderSerializer,
    CurexaPrescriptionSerializer,
    CurexaOTCSerializer,
)
from mail.services import MailService
from emr.models import Flag
from orders.models import Order, Inventory, OrderProduct
from products.models import Product
from users.models import User
from dearbrightly.models import FeatureFlag
from utils.logger_utils import logger


class CurexaService:
    CUREXA_SUCCESS_RESPONSE_STATUS = "success"
    CUREXA_MESSAGE_UPDATED_ORDER_SUCCESSFULLY = (
        "An existing order was updated successfully."
    )

    class ReplacementResponsibleParty(Enum):
        LostStolen = 1
        ConsistencyComplaint = 2
        DamagedPump = 3
        WrongAddress = 4
        FifthReason = 5  # TODO: change this when fifth reason will be added

    def create_curexa_order_for_glass_bottle(self, order: Order):
        try:
            body = CurexaOrderSerializer(order).data
        except AttributeError as error:
            logger.error(
                f"[CurexaService][create_curexa_order_for_glass_bottle] Error: {error}"
            )
            MailService.send_order_notification_email(
                order,
                notification_type="CUREXA ORDER CREATION FAILURE",
                data=str(error),
            )
            return Response(data=error, status=status.HTTP_400_BAD_REQUEST)
        otc_items = CurexaService.create_bottle_product_for_curexa_order(order=order)
        logger.debug(
            f"[CurexaService][create_curexa_order_for_glass_bottle] OTC items: {otc_items}. body: {body}"
        )
        response_data = self._make_curexa_post_request_for_glass_bottle(
            body=body, otc_items=otc_items
        )

        try:
            curexa_message = response_data.get("message")
            if response_data.get("status") == "success":
                self.update_order_status_and_prescription(
                    order=order, prescription=None
                )

                if curexa_message == "An existing order was updated successfully.":
                    MailService.send_order_notification_email(
                        order, notification_type="CUREXA ORDER UPDATE SUCCESS"
                    )
                    logger.debug(
                        f"[CurexaService][create_curexa_order_for_glass_bottle] CUREXA ORDER UPDATE SUCCESS. Body: {body}"
                    )
                else:
                    MailService.send_order_notification_email(
                        order, notification_type="CUREXA ORDER CREATION SUCCESS"
                    )
                    logger.debug(
                        f"[CurexaService][create_curexa_order_for_glass_bottle] CUREXA ORDER CREATION SUCCESS. Body: {body}"
                    )
                return Response(data=curexa_message, status=status.HTTP_200_OK)
            else:
                MailService.send_order_notification_email(
                    order, notification_type="CUREXA ORDER CREATION FAILURE"
                )
                logger.debug(
                    f"[CurexaService][create_curexa_order_for_glass_bottle] CUREXA ORDER CREATION FAILURE. Body: {body}"
                )
                return Response(data=curexa_message, status=status.HTTP_400_BAD_REQUEST)
        except json.decoder.JSONDecodeError as error:
            logger.error(
                f"[CurexaService][create_curexa_order_for_glass_bottle] JSON Decode Error: {error}"
            )
            MailService.send_order_notification_email(
                order, notification_type="CUREXA ORDER CREATION FAILURE", data=error
            )
            return Response(data=error, status=status.HTTP_400_BAD_REQUEST)

    def create_curexa_order(
        self,
        order: Order,
        prescription_data: Dict = None,
        include_otc_products: bool = True,
        replacement_data: Dict = None,
    ):
        rx_items_data = None
        if order.is_rx_order():
            if not order.customer.has_valid_rx:
                error_msg = f"{order.customer.email} does not have a valid Rx."
                logger.error(f"[CurexaService][create_curexa_order] {error_msg}")
                return Response(data=error_msg, status=status.HTTP_400_BAD_REQUEST)

            medical_visit = order.emr_medical_visit
            if not medical_visit:
                error_msg = "Unable to get medical visit for order."
                logger.error(f"[CurexaService][create_curexa_order] {error_msg}")
                MailService.send_order_notification_email(
                    order=order,
                    notification_type="CUREXA ORDER CREATION FAILURE",
                    data=error_msg,
                )
                return Response(data=error_msg, status=status.HTTP_400_BAD_REQUEST)
            rx_items_data = self.create_rx_items(
                prescription_data=prescription_data,
                medical_visit=medical_visit,
                order=order,
            )
            if not rx_items_data:
                return

            prescription = rx_items_data.get("prescription")
            if FeatureFlag.is_enabled('Nourisil Formula') and not prescription.contains_ingredient('nourisil'):
                medical_visit.status = Visit.Status.provider_pending
                medical_visit.save(update_fields=['status'])
                order.status = Order.Status.pending_medical_provider_review
                order.save(update_fields=['status'])
                body = f'Patient needs updated Nourisil formula for: {prescription.prescription.display_name}.'
                self._create_flag_for_prescription_update(visit=medical_visit, body=body)

                logger.error(f'[_create_curexa_order] {body}')
                MailService.send_order_notification_email(
                    order,
                    notification_type='CUREXA ORDER CREATION FAILURE',
                    data=body,
                )
                return Response(data=body, status=status.HTTP_400_BAD_REQUEST)

        try:
            body = CurexaOrderSerializer(order).data
        except AttributeError as error:
            logger.error(f"[CurexaService][create_curexa_order] Error: {error}")
            MailService.send_order_notification_email(
                order, notification_type="CUREXA ORDER CREATION FAILURE", data=error
            )
            return Response(data=error, status=status.HTTP_400_BAD_REQUEST)
        otc_items = (
            CurexaService.create_bottle_product_for_curexa_order(order=order)
            if include_otc_products
            else None
        )
        logger.debug(f"[CurexaService][create_curexa_order] OTC items: {otc_items}")

        rx_items = rx_items_data.get("rx_items") if rx_items_data else None

        if rx_items and rx_items[0]["pref_packaging"] == "glass w/25g tube; DB pamph; refill card; usr guide":
            otc_items = CurexaService._include_refillable_glass_bottle_in_otc_items(
                order=order, otc_items=otc_items
            )

        if replacement_data:
            rx_items, otc_items = self.update_replacement_fields(
                replacement_data=replacement_data,
                order=order,
                rx_items=rx_items,
                otc_items=otc_items,
            )
            logger.debug(f"[CurexaService][create_curexa_order] body: {body}")
            body["order_id"] = f"{body['order_id']}_DBR"
            Order.objects.filter(id=order.id).update(notes=f"Curexa replacement order: {body['order_id']}. {order.notes}")
        response_data = self.prepare_body_and_make_curexa_post_request(
            body=body, rx_items=rx_items, otc_items=otc_items
        )
        try:
            curexa_message = response_data.get("message")
            if response_data.get("status") == self.CUREXA_SUCCESS_RESPONSE_STATUS:
                prescription = rx_items_data.get("prescription") if rx_items_data else None
                self.update_order_status_and_prescription(
                    order=order, prescription=prescription
                )

                if curexa_message == self.CUREXA_MESSAGE_UPDATED_ORDER_SUCCESSFULLY:
                    MailService.send_order_notification_email(
                        order, notification_type="CUREXA ORDER UPDATE SUCCESS"
                    )
                    logger.debug(
                        f"[CurexaService][create_curexa_order] CUREXA ORDER UPDATE SUCCESS. Body: {body}"
                    )
                else:
                    MailService.send_order_notification_email(
                        order, notification_type="CUREXA ORDER CREATION SUCCESS"
                    )
                    logger.debug(
                        f"[CurexaService][create_curexa_order] CUREXA ORDER CREATION SUCCESS. Body: {body}"
                    )
                return Response(data=curexa_message, status=status.HTTP_200_OK)
            else:
                MailService.send_order_notification_email(
                    order, notification_type="CUREXA ORDER CREATION FAILURE"
                )
                logger.debug(
                    f"[CurexaService][create_curexa_order] CUREXA ORDER CREATION FAILURE. Body: {body}"
                )
                return Response(data=curexa_message, status=status.HTTP_400_BAD_REQUEST)
        except json.decoder.JSONDecodeError as error:
            logger.error(
                f"[CurexaService][create_curexa_order] JSON Decode Error: {error}"
            )
            MailService.send_order_notification_email(
                order, notification_type="CUREXA ORDER CREATION FAILURE", data=error
            )
            return Response(data=error, status=status.HTTP_400_BAD_REQUEST)
        except requests.exceptions.ConnectionError as error:
            logger.error(f'[CurexaService][create_curexa_order] Connection Error: {error}')
            MailService.send_order_notification_email(order,
                                                      notification_type='CUREXA ORDER CREATION FAILURE',
                                                      data=error)
            return Response(data=error, status=status.HTTP_400_BAD_REQUEST)

    def create_rx_items_with_prescription_data(
        self, order: Order, prescription_data: Dict
    ) -> Dict:
        # TODO (Alda) - change this to DoseSpot ID when we've swapped out Sappira
        return {
            "rx_id": str(prescription_data.get("rxcui")),
            "medication_name": prescription_data.get("exact_name")
            or prescription_data.get("exactName"),
            "quantity_dispensed": int(prescription_data.get("quantity")),
            "days_supply": int(
                prescription_data.get("days_supply")
                or prescription_data.get("daysSupply")
            ),
            "prescribing_doctor": prescription_data.get("medical_provider"),
            "medication_sig": prescription_data.get("directions"),
            "non_child_resistant_acknowledgment": True,
            "is_refill": order.is_refill,
        }

    def _curexa_post_request(self, url: str, body: Dict) -> "requests.Response":
        credentials = f"{settings.CUREXA_API_KEY}:{settings.CUREXA_SECRET_KEY}"
        encrypted_credentials = base64.b64encode(credentials.encode("utf-8")).decode(
            "utf-8"
        )
        response = requests.post(
            url=url,
            headers={"Authorization": f"Basic {encrypted_credentials}"},
            json=body,
        )
        logger.debug(
            f"[CurexaService][_curexa_post_request] Response: {response.content}"
        )

        return response

    def update_order_status_and_prescription(
        self, order: Order, prescription: PatientPrescription
    ):
        order.status = Order.Status.pending_pharmacy
        order.save(update_fields=["status"])

        # This needs to come after status save to prevent recursive call of order_status_update_handler
        if isinstance(prescription, PatientPrescription):
            order.patient_prescription = prescription
            order.save(update_fields=["patient_prescription"])

    def prepare_rx_item_data(self, medical_visit: Visit, order: Order):
        prescription = (
            medical_visit.get_latest_refill_prescription()
            if order.is_refill
            else medical_visit.get_latest_trial_prescription()
        )
        if not prescription:
            error_msg = "Unable to get prescription for order."
            logger.error(f"[CurexaService][prepare_rx_item_data] {error_msg}")
            MailService.send_order_notification_email(
                order,
                notification_type="CUREXA ORDER CREATION FAILURE",
                data=error_msg,
            )
            return

        return {
            "rx_item": CurexaPrescriptionSerializer(
                prescription, context={"is_refill": order.is_refill}
            ).data,
            "prescription": prescription,
        }

    def update_rx_item_pref_packaging(self, order: Order, rx_items: List):
        retinoid_item = (
            order.order_items.filter(product__product_type=Product.Type.rx)
            .order_by("created_datetime")
            .last()
        )
        if order.is_refill:
            if retinoid_item.bottle_type == Inventory.BottleType.refill:
                rx_items[0]["pref_packaging"] = "25g refill tube; user guide"
            else:
                rx_items[0]["pref_packaging"] = "glass w/25g tube; DB pamph; refill card; usr guide"
        else:
            rx_items[0]["pref_packaging"] = "glass w/15g tube; DB pamph; refill card; usr guide"
        logger.debug(
            f"[CurexaService][update_rx_item_pref_packaging] retinoid_item.bottle_type: {retinoid_item.bottle_type}. rx_items: {rx_items}."
        )

        return rx_items

    def update_replacement_fields(
        self, replacement_data: Dict, order: Order, rx_items: List, otc_items: List
    ) -> Tuple[List, List]:
        rx_items = (
            self.attach_replacement_data_to_list_of_items(
                list_of_items=rx_items, replacement_data=replacement_data, order=order
            )
            if rx_items
            else rx_items
        )
        otc_items = (
            self.attach_replacement_data_to_list_of_items(
                list_of_items=otc_items, replacement_data=replacement_data, order=order
            )
            if otc_items
            else otc_items
        )
        logger.debug(
            f"[CurexaService][update_replacement_fields] rx_items: {rx_items}. otc_items: {otc_items}."
        )
        return rx_items, otc_items

    @staticmethod
    def attach_replacement_data_to_list_of_items(
        list_of_items: List, replacement_data: Dict, order: Order
    ) -> List:
        list_of_items[0]["is_replacement"] = "true"
        list_of_items[0]["replaced_order_id"] = str(order.id)
        list_of_items[0]["replacement_reason"] = replacement_data.get(
            "replacement_reason"
        )
        list_of_items[0]["replacement_responsible_party"] = replacement_data.get(
            "replacement_responsible_party"
        )
        return list_of_items

    def prepare_body_and_make_curexa_post_request(
        self, body: Dict, rx_items: List, otc_items: List
    ) -> Dict:
        body["rx_items"] = rx_items
        if otc_items:
            body["otc_items"] = otc_items

        curexa_response = self._curexa_post_request(
            url=settings.CUREXA_ORDERS_URI, body=body
        )
        return json.loads(curexa_response.content)

    def create_rx_items(
        self, prescription_data: Dict, medical_visit: Visit, order: Order
    ) -> Dict:
        rx_items = []
        if not prescription_data:
            rx_item_data = self.prepare_rx_item_data(
                medical_visit=medical_visit, order=order
            )
            if not rx_item_data:
                return rx_item_data
            rx_item = rx_item_data.get("rx_item")
            prescription = rx_item_data.get("prescription")
            logger.debug(
                f"[CurexaService][create_rx_items] Visit: {medical_visit}. Prescription: {prescription}. Rx item: {rx_item}"
            )

            rx_items.append(rx_item)
        else:
            patient_prescription = self.create_rx_items_with_prescription_data(
                order=order, prescription_data=prescription_data
            )
            logger.debug(
                f"[CurexaService][create_rx_items] Prescription data: {prescription_data}. "
                f"Patient prescription {patient_prescription}"
            )
            rx_items.append(patient_prescription)
            prescription = patient_prescription

        rx_items = self.update_rx_item_pref_packaging(order=order, rx_items=rx_items)

        return {"rx_items": rx_items, "prescription": prescription}

    @staticmethod
    def create_bottle_product_for_curexa_order(order: Order) -> List:
        return [
            CurexaOTCSerializer(otc_item).data
            for otc_item in order.order_items.filter(
                Q(product__product_category=Product.Category.bottle)
            )
        ]

    def cancel_curexa_order(self, order: Order):
        logger.debug(
            f"[CurexaService][cancel_curexa_order] Cancelling order: {order.id}"
        )
        curexa_response = self._curexa_post_request(
            url=settings.CUREXA_CANCEL_ORDER_URI, body={"order_id": order.id}
        )
        try:
            response_data = json.loads(curexa_response.content)
            if response_data.get("status") == "success":
                MailService.send_order_notification_email(
                    order=order, notification_type="CUREXA ORDER CANCEL SUCCESS"
                )
            else:
                MailService.send_order_notification_email(
                    order=order,
                    notification_type="CUREXA ORDER CANCEL FAILURE",
                    data=response_data.get("message"),
                )
        except json.decoder.JSONDecodeError as error:
            logger.error(f"[CurexaService][cancel_curexa_order] Error: {error}")
            MailService.send_order_notification_email(
                order=order, notification_type="CUREXA ORDER CANCEL FAILURE", data=error
            )

        return curexa_response

    def _make_curexa_post_request_for_glass_bottle(
        self, body: Dict, otc_items: List
    ) -> Dict:
        body["otc_items"] = otc_items
        curexa_response = self._curexa_post_request(
            url=settings.CUREXA_ORDERS_URI, body=body
        )
        return json.loads(curexa_response.content)

    def _create_flag_for_prescription_update(self, visit, body):
        try:
            admin_user = User.objects.get(
                email='dearbrightly.test+admin@gmail.com') if settings.DEBUG else User.objects.get(
                email='admin@dearbrightly.com')
            new_flag = Flag(creator=admin_user, visit=visit, body=body,
                            category=Flag.Category.require_prescription_update)
            new_flag.save()
            logger.debug(
                f'[CurexaService][_create_flag_for_prescription_update] Flag created: {new_flag}')
        except User.DoesNotExist:
            logger.error(
                f'[CurexaService][_create_flag_for_prescription_update] Admin user for Flag creation does not exist.')
            
    @staticmethod
    def _include_refillable_glass_bottle_in_otc_items(order: Order, otc_items: List) -> List:
        product = Product.objects.filter(name="Night Shift Refillable Glass Bottle").last()
        if product not in order.get_products():
            otc_items.append(CurexaOTCSerializer(OrderProduct(product=product)).data)
        return otc_items
