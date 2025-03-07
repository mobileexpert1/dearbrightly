from rest_framework import serializers
from users.models import ShippingDetails
from orders.models import OrderProduct
from utils.logger_utils import logger

class ShippoShippingSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    street1 = serializers.ReadOnlyField(source='address_line1')
    street2 = serializers.ReadOnlyField(source='address_line2')
    zip = serializers.ReadOnlyField(source='postal_code')
    country = serializers.SerializerMethodField()

    def get_name(self, obj):
        logger.debug(f'[ShippoShippingSerializer][get_name] obj: {obj.first_name}')
        # first_name = obj.get('first_name', None)
        # last_name = obj.get('last_name', None)
        return f'{obj.first_name} {obj.last_name}'

    def get_country(self, obj):
        return "US"

    class Meta:
        model = ShippingDetails
        fields = (
            "name",
            "street1",
            "street2",
            "city",
            "state",
            "zip",
            "country"
        )

class ShippoParcelSerializer(serializers.ModelSerializer):
    length = serializers.ReadOnlyField(source='product.length')
    width = serializers.ReadOnlyField(source='product.width')
    height = serializers.ReadOnlyField(source='product.height')
    distance_unit = serializers.SerializerMethodField()
    weight = serializers.SerializerMethodField()
    mass_unit = serializers.SerializerMethodField()

    def get_weight(self, obj):
        total_weight = obj.quantity * obj.product.weight
        # logger.debug(f'[ShippoParcelSerializer][get_weight] obj: {obj.__dict__}. total_weight: {total_weight}. '
        #              f'quantity: {obj.quantity}. obj.product.weight: {obj.product.weight}')
        return total_weight

    def get_distance_unit(self, obj):
        return "in"

    def get_mass_unit(self, obj):
        return "oz"

    class Meta:
        model = OrderProduct
        fields = (
            "length",
            "width",
            "height",
            "distance_unit",
            "weight",
            "mass_unit"
        )