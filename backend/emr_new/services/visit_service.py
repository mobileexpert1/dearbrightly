from django.db.models.signals import post_save
from django.dispatch.dispatcher import receiver

from db_analytics.services import KlaviyoService
from emr.models import Visit
from emr_new.services.curexa_service import CurexaService
from orders.models import Order
from products.models import Product
from utils.logger_utils import logger


class VisitService:
    @staticmethod
    @receiver(post_save, sender=Order)
    def order_status_update_handler_new(sender, instance, **kwargs):
        if kwargs.get("raw", True):
            return
        logger.debug(f"[VisitService][order_status_update_handler] Order: {instance}.")
        if instance.id:
            VisitService._handle_operations_for_existing_order(order=instance, **kwargs)

    @staticmethod
    def _handle_operations_for_existing_order(order: Order, **kwargs):
        original_order_status = order.get_original_status()
        logger.debug(
            f"[VisitService][_handle_operations_for_existing_order] Order: {order.id}. "
            f"Purchased datetime: {order.purchased_datetime}. "
            f"Medical visit: {order.emr_medical_visit}. "
            f"original order status: {original_order_status}. status: {order.status}."
        )

        VisitService.check_order_status_if_canceled_and_cancel_in_curexa_and_klaviyo(
            order=order, original_order_status=original_order_status
        )
        VisitService.do_operations_after_order_status_is_payment_complete(
            order=order, original_order_status=original_order_status
        )

    @staticmethod
    def check_order_status_if_canceled_and_cancel_in_curexa_and_klaviyo(
        order: Order, original_order_status: str
    ):
        if int(order.status) == Order.Status.cancelled:
            if int(original_order_status) == Order.Status.pending_pharmacy:
                CurexaService().cancel_curexa_order(order=order)
            KlaviyoService().track_canceled_order_event(order=order)

    @staticmethod
    def do_operations_after_order_status_is_payment_complete(
        order: Order, original_order_status: str
    ):
        """
        After payment is complete:
            - visits with completed skin profile should be queued for the doctor
            - orders with valid visits should be pushed to Curexa
            - users with expired visits should update order status to pending questionnaire
        """
        if (
                (int(order.status) == Order.Status.payment_complete and int(original_order_status) != Order.Status.payment_complete) or
                (int(order.status) == Order.Status.payment_complete and order.shopify_order_id)
        ):
            if order.order_items.filter(
                    product__name="Night Shift Refillable Glass Bottle"
            ):
                logger.debug(
                    f"[VisitService][order_status_update_handler] Glass Bottle Curexa order creation. "
                    f"Order: {order.id}. "
                    f"Order status: {order.status}. "
                    f"Glass bottle item: {order.order_items.filter(product__product_category=Product.Category.bottle)}"
                )
                CurexaService().create_curexa_order_for_glass_bottle(order=order)

            if order.emr_medical_visit:
                if order.emr_medical_visit.is_expired:
                    Order.objects.filter(pk=order.id).update(
                        status=Order.Status.pending_questionnaire
                    )
                elif (
                    order.emr_medical_visit.status == Visit.Status.skin_profile_complete
                ):
                    order.emr_medical_visit.status = Visit.Status.provider_pending
                    order.emr_medical_visit.save(update_fields=["status"])
                    logger.debug(
                        f"[VisitService][order_status_update_handler] Medical visit queued. "
                        f"Order: {order.id}. "
                        f"Order status: {order.status}."
                        f"Visit {order.emr_medical_visit.id}."
                    )
                elif order.emr_medical_visit.status in (
                    Visit.Status.provider_rx_submitted,
                    Visit.Status.provider_signed,
                ):
                    CurexaService().create_curexa_order(order=order)
                    logger.debug(
                        f"[VisitService][order_status_update_handler] Curexa order created. "
                        f"Order: {order.id}. "
                        f"instance.emr_medical_visit: {order.emr_medical_visit}."
                    )
            elif order.is_rx_order():
                Order.objects.filter(pk=order.id).update(
                    status=Order.Status.pending_questionnaire
                )
