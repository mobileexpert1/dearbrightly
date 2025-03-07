from rest_framework import serializers
from rest_framework.fields import CharField

from products.models import Product


class StringArrayField(CharField):
    def to_representation(self, obj):
        obj = super().to_representation(obj)
        return obj.split('\n')


class ProductSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField(source='uuid')
    description = StringArrayField(required=False)
    benefits = StringArrayField(required=False)
    forever_five_reasons = StringArrayField(required=False)
    ingredients_highlight = StringArrayField(required=False)
    refill_price = serializers.ReadOnlyField(source='refill_product.price')
    trial_price = serializers.ReadOnlyField(source='trial_product.price')
    is_refill = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ('benefits', 'description', 'forever_five_reasons', 'how_to_use', 'id', 'image', 'ingredients',
                  'ingredients_highlight', 'is_hidden', 'is_plan_product', 'is_refill', 'large_image', 'name', 'price', 'product_category',
                  'product_summary', 'product_type', 'refill_price', 'trial_price', 'sku', 'subscription_price')

    def get_is_refill(self, obj):
        if obj.refill_product:
            return obj.refill_product.id == obj.id
        return False
