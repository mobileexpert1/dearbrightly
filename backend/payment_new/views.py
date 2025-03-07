from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet, ModelViewSet
from rest_framework.viewsets import ViewSet
from rest_framework.generics import GenericAPIView

from orders.models import Order
from payment.models import Coupon
from payment_new.permissions import DearBrightlyAPIKeyAuth
from payment_new.services.coupon_service import CouponService
from orders.serializers import OrderSerializer
from payment_new.services.payment_service import PaymentService
from payment_new.serializers import (
    OutputCouponSerializer,
    InputCouponSerializer,
)
from payment_new.serializers import (
    AuthorizePaymentSerializer,
    DiscountInputSerializer,
    DiscountOutputSerializer,
)
from utils.logger_utils import logger
from db_analytics.services import FacebookConversionServices


class PaymentViewSet(ViewSet):
    @action(methods=("post",), detail=False, permission_classes=(AllowAny,))
    def get_discount(self, request):
        """
        :param request: discount_code (string)
        :param request: product_uuids (list of products uuids)
        :return: amount_off, percent_off, discount_code
        """

        serializer = DiscountInputSerializer(data=request.data)

        if not serializer.is_valid():
            logger.error(f"[PaymentViewSet][get_discount] {serializer.errors}")
            return Response(
                data={"detail": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )
        logger.debug(
            f"[PaymentViewSet][get_discount] {serializer.data}. request.data: {request.data}"
        )

        is_anonymous = request.user.is_anonymous if request and request.user else False
        customer = request.user if request and not is_anonymous else None

        data = PaymentService().get_discount(
            discount_code=serializer.data["discount_code"],
            shopping_bag_data=serializer.data["products"],
            customer=customer,
        )
        output_serializer = DiscountOutputSerializer(data=data)
        logger.debug(f"[PaymentViewSet][get_discount] data: {data}")
        output_serializer.is_valid(raise_exception=True)

        return Response(data=output_serializer.data, status=status.HTTP_200_OK)


class AuthorizePaymentAPIView(GenericAPIView):
    serializer_class = AuthorizePaymentSerializer
    lookup_field = "uuid"
    lookup_url_kwarg = "order_uuid"

    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        logger.debug(
            f"[AuthorizePaymentAPIView][authorize_payment]"
        )
        if not serializer.is_valid():
            logger.debug(
                f"[AuthorizePaymentAPIView][authorize_payment] {serializer.errors}"
            )
            return Response(
                {"detail": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
            )

        order = PaymentService().authorize_payment(
            request=request, token=serializer.data["token"], order=self.get_object()
        )

        if order.is_otc_only():
            FacebookConversionServices().track_purchase_event(self.request, self.request.user, order)

        return Response(
            data=OrderSerializer(order).data,
            status=status.HTTP_200_OK,
        )


class CouponViewSet(ModelViewSet):
    queryset = Coupon.objects.filter(is_active=True)
    permission_classes = (DearBrightlyAPIKeyAuth,)
    serializer_class = OutputCouponSerializer

    def create(self, request, *args, **kwargs):
        serializer = InputCouponSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        return Response(
            self.get_serializer(
                CouponService().create_coupon(
                    coupon_data=serializer.validated_data,
                    allowed_customers_emails=serializer.validated_data.pop(
                        "allowed_customers", None
                    ),
                    discounted_products_ids=serializer.validated_data.pop(
                        "discounted_products", None
                    ),
                )
            ).data,
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        coupon = self.get_object()
        serializer = InputCouponSerializer(coupon, data=request.data)
        serializer.is_valid(raise_exception=True)

        return Response(
            self.get_serializer(
                CouponService().update_coupon(
                    coupon=coupon,
                    coupon_data=serializer.validated_data,
                    allowed_customers_emails=serializer.validated_data.pop(
                        "allowed_customers", None
                    ),
                    discounted_products_ids=serializer.validated_data.pop(
                        "discounted_products", None
                    ),
                )
            ).data,
            status=status.HTTP_200_OK,
        )
