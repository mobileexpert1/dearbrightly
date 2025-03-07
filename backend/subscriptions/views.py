from rest_framework.exceptions import APIException, ValidationError
from rest_framework import mixins, status, viewsets
from subscriptions.permissions import IsAdminOrUser, Dear_Brightly_API_Key_Auth, IsAdminOrUserWithUserUuidCheck
from subscriptions.models import Subscription
from subscriptions.serializers import SubscriptionSerializer, PatchSelectedSubscriptionOrdersAndPushToCurexaSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from django.utils import timezone
from django.shortcuts import get_object_or_404, get_list_or_404
from subscriptions.services import SubscriptionsService
from products.models import Product
from users.models import User, ShippingDetails
from db_shopify.services.subscription_service import RechargeSubscriptionService
from users.serializers import ShippingDetailsSerializer, PaymentDetailsSerializer
from db_shopify.services.services import ShopifyService

import logging
logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
logger = logging.getLogger(__name__)


class SubscriptionViewSet(mixins.CreateModelMixin,
                          mixins.RetrieveModelMixin,
                          mixins.UpdateModelMixin,
                          mixins.ListModelMixin,
                          viewsets.GenericViewSet
                          ):
    serializer_class = SubscriptionSerializer
    lookup_field = 'uuid'

    def get_permissions(self):
        if self.action in ['patch_subscription_created_datetime',
                           'clean_subscriptions',
                           'patch_create_subscription',
                           'patch_subscription_order_and_push_to_curexa',
                           'patch_selected_subscription_orders_and_push_to_curexa',
                           'patch_subscription_order',
                           'patch_subscription_end_datetime',
                           'cancel_all_stripe_subscriptions',
                           'get_or_create_subscription',
                           'handle_upcoming_subscription_orders',
                           'create_invoice',
                           'cancel_subscription']:
            permission_classes = [Dear_Brightly_API_Key_Auth]
        else:  # ['create', 'update', 'partial_update', 'retrieve', 'list']
            permission_classes = [IsAdminOrUser]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        qs = Subscription.objects.none()

        if user and user.is_superuser:
            qs = Subscription.objects.all().order_by('-created_datetime')

        if user and not user.is_superuser:
            qs = user.subscriptions.all().order_by('-created_datetime')

        logger.debug(f'[SubscriptionViewSet][get_queryset] qs: {qs}')
        return qs

    def validate_ids(self, id_list):
        for id in id_list:
            try:
                Subscription.objects.get(uuid=id)
            except (Subscription.DoesNotExist, ValidationError):
                error_msg = f'Subscription {id} does not exist.'
                raise ValidationError(error_msg)
        return True

    def partial_update(self, request, *args, **kwargs):
        subscription = Subscription.objects.get(uuid=kwargs.get("uuid"))
        serializer = self.get_serializer(subscription, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        if subscription.is_shopify_subscription:
            RechargeSubscriptionService.update_subscription(
                subscription=subscription, validated_data=serializer.validated_data,
            )
        serializer.save()
        
        data = SubscriptionsService().retrieve_payment_details_and_serialize_subscriptions(
            user=subscription.customer,
            subscriptions=Subscription.objects.filter(uuid=subscription.uuid),
        )
        return Response(data[0], status=status.HTTP_200_OK)

    def put(self, request, *args, **kwargs):
        data = request.data
        subscription_ids = [i['uuid'] for i in data]
        try:
            self.validate_ids(id_list=subscription_ids)
            subscriptions = Subscription.objects.filter(uuid__in=subscription_ids)
            for subscription_data in data:
                subscription_uuid = subscription_data.get('uuid')
                subscription = subscriptions.get(uuid=subscription_uuid)
                serializer = self.get_serializer(subscription, data=subscription_data, partial=True)
                serializer.is_valid(raise_exception=True)
                if subscription.is_shopify_subscription:
                    RechargeSubscriptionService.update_subscription(
                        subscription=subscription, validated_data=serializer.validated_data,
                    )
                serializer.save()

            data = SubscriptionsService().retrieve_payment_details_and_serialize_subscriptions(
                user=subscriptions[0].customer,
                subscriptions=subscriptions,
            )
            logger.debug(f'[SubscriptionViewSet][put] Serializer data: {serializer.data}')
            return Response(data)
        except (Subscription.DoesNotExist, ValidationError) as error:
            logger.error(f'[SubscriptionViewSet][put] error: {error}')
            return Response(status=status.HTTP_400_BAD_REQUEST, data={'detail': error.detail})

    @action(detail=False, methods=['post'],)
    def update_shipping_details(self, request):
        data = request.data.get("data")
        customer_id = data.get("customer_id") if data else None
        shipping_details_id = data.get("id") if data else None
        shipping_details_data = data.get("shipping_details") if data else None
        subscriptions = data.get("subscriptions") if data else None

        customer = get_object_or_404(User, uuid=customer_id)
        shipping_details = get_object_or_404(ShippingDetails, id=shipping_details_id)
        subscriptions = Subscription.objects.filter(uuid__in=[subscription.get("uuid") for subscription in subscriptions])

        # logger.debug(f'[SubscriptionViewSet][update_shipping_details] '
        #              f'shipping_details_id: {shipping_details_id}. subscriptions: {subscriptions}. shipping_details_data: {shipping_details_data}.')
        shipping_details = SubscriptionsService().update_or_create_shipping_details(
            customer=customer,
            subscriptions_to_update=subscriptions,
            shipping_details_to_update=shipping_details,
            shipping_details_data=shipping_details_data,
        )
        
        return Response(
            data=ShippingDetailsSerializer(shipping_details).data, status=status.HTTP_200_OK
        )
        
    @action(detail=False, methods=['post'],)
    def update_or_create_subscription(self, request):
        serializer = SubscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        logger.debug(f'[SubscriptionViewSet][update_or_create_subscription] serializer.validated_data: {serializer.validated_data}')
        customer_uuid = serializer.validated_data.get("customer").get("uuid") if serializer.validated_data.get("customer") else None
        product_uuid = serializer.validated_data.get("product").get("uuid") if serializer.validated_data.get("product") else None

        customer = get_object_or_404(User, uuid=customer_uuid)
        product = get_object_or_404(Product, uuid=product_uuid)

        try:
            existing_subscriptions = customer.subscriptions.filter(product=product)
            if existing_subscriptions:
                subscription = existing_subscriptions.latest('created_datetime')
                serializer = SubscriptionSerializer(subscription, data=request.data, partial=True)
                serializer.is_valid(raise_exception=True)
                if subscription.is_shopify_subscription:
                    RechargeSubscriptionService.update_subscription(
                        subscription=subscription, validated_data=serializer.validated_data,
                    )
            elif (
                not customer.payment_processor_customer_id
                and customer.recharge_user_id
            ):
                latest_recharge_subscription = customer.subscriptions.filter(
                    is_active=True,
                    recharge_address_id__isnull=False,
                    shipping_details__isnull=False,
                    recharge_payment_method_id__isnull=False,
                ).latest('created_datetime')
                if latest_recharge_subscription:
                    recharge_subscription_id = RechargeSubscriptionService.create_subscription(
                        user=customer, 
                        validated_data=serializer.validated_data,
                        recharge_address_id=latest_recharge_subscription.recharge_address_id,
                    )
                    serializer.validated_data["recharge_subscription_id"] = recharge_subscription_id
                    serializer.validated_data["recharge_address_id"] = latest_recharge_subscription.recharge_address_id
                    serializer.validated_data["recharge_payment_method_id"] = latest_recharge_subscription.recharge_payment_method_id
                    serializer.validated_data["shipping_details"] = latest_recharge_subscription.shipping_details
            subscription = serializer.save()

            data = SubscriptionsService().retrieve_payment_details_and_serialize_subscriptions(
                user=customer,
                subscriptions=Subscription.objects.filter(uuid=subscription.uuid),
            )
            logger.debug(
                f'[SubscriptionViewSet][update_or_create_subscription] subscription: {subscription}')
            return Response(data=data[0], status=status.HTTP_200_OK)
        except APIException as error:
            return Response(status=status.HTTP_400_BAD_REQUEST, data={'detail': error.detail})

    @action(detail=False, methods=['post'],)
    def cancel_subscription(self, request):
        subscription_id = request.data.get('id')
        cancel_datetime = request.data.get('cancel_datetime')
        subscription = get_object_or_404(Subscription, id=subscription_id)
        cancel_reason = request.data.get("cancel_reason")

        subscription = SubscriptionsService().cancel_subscription(subscription, cancel_reason, cancel_datetime)

        return Response(data=SubscriptionSerializer(subscription).data, status=status.HTTP_200_OK)

    # Captures initial payment, then starts subscription (with trial period for the end of the cycle) for given order
    # This is what is triggered after a new prescription is created
    @action(detail=False, methods=['post'],)
    def patch_create_subscription(self, request):
        from orders.models import Order
        from subscriptions.services import SubscriptionsService

        order_id = request.data.get('order_id')
        order = get_object_or_404(Order, id=order_id)

        SubscriptionsService().update_or_create_subscription(order=order,
                                                             start_time=timezone.now())

        return Response(status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'],)
    def patch_subscription_order_and_push_to_curexa(self, request):
        from subscriptions.services import SubscriptionsService
        from users.models import User

        id = request.data.get('id')
        capture_payment = request.data.get('capture_payment')
        if id:
            user = get_object_or_404(User, id=id)

        try:
            SubscriptionsService().patch_subscription_order_and_push_to_curexa(
                user=user,
                push_to_curexa=True,
                capture_payment=capture_payment)
            return Response(status=status.HTTP_200_OK)
        except APIException as error:
            return Response(status=status.HTTP_400_BAD_REQUEST)

    @action(
        detail=False,
        methods=["post"],
    )
    def patch_selected_subscription_orders_and_push_to_curexa(self, request):
        serializer = PatchSelectedSubscriptionOrdersAndPushToCurexaSerializer(
            data=request.data
        )
        serializer.is_valid(raise_exception=True)

        try:
            SubscriptionsService().patch_subscription_order_and_push_to_curexa(
                user=User.objects.get(id=serializer.validated_data.get("user_id")),
                subscription_ids=serializer.validated_data.get("subscription_ids"),
                push_to_curexa=True,
                capture_payment=serializer.validated_data.get("capture_payment"),
            )
            return Response(status=status.HTTP_200_OK)
        except APIException as error:
            return Response(
                status=status.HTTP_400_BAD_REQUEST, data={"detail": error.detail}
            )

    @action(detail=False, methods=['post'],)
    def patch_subscription_order(self, request):
        from subscriptions.services import SubscriptionsService
        from users.models import User

        id = request.data.get('id')
        if id:
            user = get_object_or_404(User, id=id)

        try:
            SubscriptionsService().patch_subscription_order_and_push_to_curexa(
                user=user,
                push_to_curexa=False,
                capture_payment=False)
            return Response(status=status.HTTP_200_OK)
        except APIException as error:
            return Response(status=status.HTTP_400_BAD_REQUEST)

    @action(methods=('post',), detail=False)
    def handle_upcoming_subscription_orders(self, request):
        try:
            SubscriptionsService().handle_upcoming_subscription_orders()
            return Response(status=status.HTTP_200_OK)
        except APIException as error:
            return Response(data={'detail': error.detail},
                            status=status.HTTP_400_BAD_REQUEST)

    @action(methods=('post',), detail=False)
    def create_invoice(self, request):
        from users.models import User
        try:
            user_id = request.data.get('user_id')
            subscription_ids = request.data.get('subscription_ids')
            subscriptions = Subscription.objects.filter(pk__in=subscription_ids)
            user = get_object_or_404(User, id=user_id)
            customer_subscription = user.subscriptions.latest('created_datetime')
            order = SubscriptionsService().get_or_create_upcoming_subscription_order(
                    subscriptions=subscriptions, customer=user
                )
            SubscriptionsService().invoice_order(
                subscription=customer_subscription,
                customer=user,
                order=order,
            )
            return Response(status=status.HTTP_200_OK)
        except APIException as error:
            return Response(data={'detail': error.detail},
                            status=status.HTTP_400_BAD_REQUEST)

class UserSubscriptionListView(ListAPIView):
    serializer_class = SubscriptionSerializer
    lookup_field = 'uuid'
    permission_classes = (IsAdminOrUserWithUserUuidCheck,)
    ordering = ['-created_datetime']

    def get_queryset(self):
        user_uuid = self.kwargs['user_uuid']
        return Subscription.objects.all().filter(customer__uuid=user_uuid).order_by('current_period_end_datetime')
    
    def get(self, request, *args, **kwargs):
        user_uuid = self.kwargs["user_uuid"]
        user = get_object_or_404(User, uuid=user_uuid)

        try:
            if not user.recharge_user_id:
                user = RechargeSubscriptionService.parse_recharge_user_id(user=user)
            if not user.shopify_user_id:
                customer_shopify_user_id = ShopifyService._get_customer_id_by_email(email=user.email)
                if customer_shopify_user_id:
                    user.shopify_user_id = customer_shopify_user_id
                    user.save(update_fields=['shopify_user_id'])
            if user and user.recharge_user_id:
                RechargeSubscriptionService.update_subscription_with_recharge_subscription_data(user=user, order=None)
        except APIException as error:
            logger.error(f"[UserSubscriptionListView][get_queryset] {error}")

        data = None
        try:
            data = SubscriptionsService().retrieve_payment_details_and_serialize_subscriptions(
                user=user, subscriptions=self.get_queryset()
            )
        except ValidationError as error:
            logger.error(f"[UserSubscriptionListView][get_queryset] Serialization error: {error}")

        return Response(data)
