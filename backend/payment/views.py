from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import APIException
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet
from django.shortcuts import get_object_or_404
from payment.services.services import Service
from orders.models import Order
from utils.logger_utils import logger
import uuid
from django.db.models import Q
from payment.permissions import Dear_Brightly_API_Key_Auth, IsOwnerOrAdmin, IsUserCheckingOut
from db_analytics.services import FacebookConversionServices

# TODO (Alda) - Change permission classes
class PaymentViewSet(ViewSet):
    permission_classes = (IsAuthenticated,)

    @action(url_path='webhook_handler/(?P<service_platform>[\w.@+-]+)', methods=('post',), permission_classes=(AllowAny,), detail=False)
    def webhook_handler(self, request, service_platform):
        Service().webhook_handler(request, service_platform)
        return Response(data={'status': True}, status=status.HTTP_200_OK)

    @action(methods=('post',), permission_classes=(AllowAny,), detail=False)
    def get_discount(self, request):
        """
        :param request: promo (string)
        :return: amount_off, percent_off
        """
        discount_code = request.data.get('promo', None)
        products = request.data.get('products', None)
        if not discount_code:
            error_msg = f'Missing discount code parameter.'
            logger.error(error_msg)
            return Response(data={'detail': error_msg}, status=status.HTTP_400_BAD_REQUEST)

        return Service().get_discount(discount_code, products)

    @action(methods=('post',), detail=False, permission_classes=(Dear_Brightly_API_Key_Auth,))
    def create_stripe_charge(self, request):
        try:
            order_id = request.data.get('order_id')
            order = get_object_or_404(Order, id=order_id)

            stripe_connect_user_id = Service().create_stripe_charge(order)
            return Response(data=stripe_connect_user_id, status=status.HTTP_200_OK)

        except APIException as error:
            return Response(data={'detail': error.detail},
                            status=status.HTTP_400_BAD_REQUEST)


    @action(methods=('post',), detail=False)
    def fetch_stripe_connect_user_id(self, request):
        try:
            user_uuid = request.data.get('user_uuid')
            authorization_code = request.data.get('authorization_code')
            logger.debug(f'[fetch_stripe_connect_user_id] User UUID: {user_uuid}. Authorization code: {authorization_code}. Request data: {request.data}. User: {request.user.uuid}')

            if request.user.uuid == uuid.UUID(user_uuid):
                stripe_connect_user_id = Service().fetch_stripe_connect_user_id(request, authorization_code)
                return Response(data=stripe_connect_user_id, status=status.HTTP_200_OK)
            else:
                error_msg = f'Invalid user UUID: {user_uuid}'
                logger.error(f'[fetch_stripe_connect_user_id] Unable to fetch Stripe Connect user id: {error_msg})')
                return Response(data={'detail': error_msg},
                                status=status.HTTP_400_BAD_REQUEST)
        except APIException as error:
            return Response(data={'detail': error.detail},
                            status=status.HTTP_400_BAD_REQUEST)

    @action(methods=('post',), detail=False, permission_classes=(Dear_Brightly_API_Key_Auth,),)
    def patch_tax_jar_transactions(self, request):
        from payment.services.tax_jar_services import TaxJarService
        try:
            orders_id = request.data.get('order_ids')

            for order_id in orders_id:
                try:
                    order =  Order.objects.get(id=int(order_id))
                    TaxJarService().create_transaction(order)
                    logger.debug(f'[patch_tax_jar_transactions] Patching order: {order_id}')

                except Order.DoesNotExist:
                    logger.error(f'[patch_tax_jar_transactions] Order {order_id} does not exist')

        except APIException as error:
            logger.error(f'[patch_tax_jar_transactions] Unable to create transaction for: {order_id}. Error: {error}.')

        return Response(status=status.HTTP_200_OK)

    @action(methods=('post',), detail=False, permission_classes=(Dear_Brightly_API_Key_Auth,),)
    def stripe_payout_to_bank(self, request):
        try:
            payout_amount = request.data.get('payout_amount', None)
            payout_threshold = request.data.get('payout_threshold', None)
            Service().stripe_payout_to_bank(payout_amount=payout_amount, payout_threshold=payout_threshold)
            return Response(status=status.HTTP_200_OK)
        except APIException as error:
            return Response(data={'detail': error.detail},
                            status=status.HTTP_400_BAD_REQUEST)

    @action(methods=('post',), detail=False, permission_classes=(Dear_Brightly_API_Key_Auth,),)
    def transfer_stripe_fees(self, request):
        from emr.models import Visit
        try:
            visit_id = request.data.get('visit_id', None)
            visit = get_object_or_404(Visit, id=visit_id)

            orders = visit.orders.filter(~Q(status=Order.Status.refunded) &
                                         ~Q(status=Order.Status.cancelled) &
                                         Q(payment_captured_datetime__isnull=False))
            start_of_cycle_order = orders.earliest('payment_captured_datetime') if orders else None

            Service().transfer_fees(order=start_of_cycle_order)
            return Response(status=status.HTTP_200_OK)
        except APIException as error:
            return Response(data={'detail': error.detail},
                            status=status.HTTP_400_BAD_REQUEST)

    @action(methods=('post',), detail=False, permission_classes=(Dear_Brightly_API_Key_Auth,),)
    def reverse_transfer_fees(self, request):
        from emr.models import Visit
        try:
            visit_id = request.data.get('visit_id', None)
            visit = get_object_or_404(Visit, id=visit_id)
            Service().reverse_transfer_fees(visit=visit)
            return Response(status=status.HTTP_200_OK)
        except APIException as error:
            return Response(data={'detail': error.detail},
                            status=status.HTTP_400_BAD_REQUEST)

    @action(methods=('post',), detail=False, permission_classes=(Dear_Brightly_API_Key_Auth,),)
    def refund_order(self, request):
        from orders.models import Order
        try:
            order_id = request.data.get('order_id', None)
            refund_amount = request.data.get('refund_amount', None)
            order = get_object_or_404(Order, id=int(order_id))
            Service().refund_order(order, reverse_transfer=False, refund_amount=int(float(refund_amount)*100))
            return Response(status=status.HTTP_200_OK)
        except APIException as error:
            return Response(data={'detail': error.detail},
                            status=status.HTTP_400_BAD_REQUEST)

    @action(methods=('post',), detail=False, permission_classes=(Dear_Brightly_API_Key_Auth,),)
    def patch_stripe_transfer_to_medical_provider(self, request):
        try:
            Service().update_transfer_payment_to_medical_provider()
            return Response(status=status.HTTP_200_OK)
        except APIException as error:
            return Response(data={'detail': error.detail},
                            status=status.HTTP_400_BAD_REQUEST)