from rest_framework import serializers

from products.models import Product


class StringArrayField(serializers.CharField):
    """Custom serializer field to create a list of sentences."""

    def to_representation(self, obj):
        representation = super().to_representation(obj)
        return representation.split("\n")


class ProductSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField(source="uuid")
    description = StringArrayField()
    benefits = StringArrayField()
    ingredients_highlight = StringArrayField(required=False)
    refill_price = serializers.ReadOnlyField(source="refill_product.price")
    trial_price = serializers.ReadOnlyField(source="trial_product.price")

    class Meta:
        model = Product
        fields = (
            "id",
            "is_hidden",
            "product_type",
            "product_category",
            "name",
            "product_summary",
            "description",
            "quantity_available",
            "strength",
            "strength_unit",
            "days_supply",
            "image",
            "large_image",
            "benefits",
            "refill_price",
            "trial_price",
            "ingredients_highlight",
        )

    def get_is_refill(self, obj):
        if obj.refill_product:
            return obj.refill_product.id == obj.id
        return False
