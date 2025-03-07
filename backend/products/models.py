from uuid import uuid1, uuid5
from django.db import models
from django.utils.translation import ugettext_lazy as _
from djchoices import DjangoChoices, ChoiceItem

class SetProduct(models.Model):
    product_in_set = models.ForeignKey('products.Product', null=True, blank=True,
                                on_delete=models.SET_NULL, related_name='sets')
    set_product = models.ForeignKey('products.Product', null=True, blank=True,
                                on_delete=models.SET_NULL, related_name='set_products')

class Product(models.Model):

    class Type(DjangoChoices):
        none = ChoiceItem('None')
        rx = ChoiceItem('Rx')
        otc = ChoiceItem('OTC')

    class Category(DjangoChoices):
        none = ChoiceItem('none')
        retinoid = ChoiceItem('retinoid')
        moisturizer = ChoiceItem('moisturizer')
        bottle = ChoiceItem('bottle')
        cleanser = ChoiceItem('cleanser')

    uuid = models.UUIDField(blank=False, unique=True)
    created_datetime = models.DateTimeField(auto_now_add=True)
    last_modified_datetime = models.DateTimeField(auto_now=True)
    is_hidden = models.BooleanField(_('hidden'), default=False,
                                   help_text=_('Determines if the product is browsable by users.'))
    is_set = models.BooleanField(_('is set'), default=False,
                                   help_text=_('Determines if the product is a collection of other products.'))
    is_plan_product = models.BooleanField(_('is plan product'), default=False,
                                   help_text=_('Determines if the product can be added to a plan.'))
    product_type = models.CharField(_('Type'), max_length=32, default=Type.rx, choices=Type.choices)
    product_category = models.CharField(_('Category'), max_length=64, default=Category.none, choices=Category.choices)
    name = models.CharField(_('Name'), max_length=64, blank=True)
    product_summary = models.CharField(_('Name'), max_length=64, blank=True)
    description = models.CharField(_('Description'), max_length=512, blank=True)
    quantity = models.IntegerField(_('Quantity'), default=0)
    quantity_available = models.IntegerField(_('Quantity available'), default=0)
    quantity_unit = models.CharField(_('Quantity unit'), max_length=16, blank=True)
    strength = models.IntegerField(_('Strength'), default=0)
    strength_unit = models.CharField(_('Strength unit'), max_length=16, blank=True)
    vehicle = models.CharField(_('Vehicle'), max_length=32, blank=True)
    days_supply = models.IntegerField(_('Days supply'), default=0)
    sku = models.CharField(_('SKU'), max_length=32, blank=True)
    smart_warehouse_sku = models.CharField(_('Smart Warehouse SKU'), max_length=32, blank=True, null=True)
    refill_product = models.ForeignKey('products.Product', null=True, blank=True, on_delete=models.SET_NULL, related_name='refill_products')
    trial_product = models.ForeignKey('products.Product', null=True, blank=True, on_delete=models.SET_NULL, related_name='trial_products')
    price = models.PositiveIntegerField(default=0)
    subscription_price = models.PositiveIntegerField(default=0)
    image = models.CharField(_('Image'), max_length=128, blank=True)
    large_image = models.CharField(_('Large image'), max_length=128, blank=True)
    benefits = models.CharField(_('Benefits'),max_length=1024, blank=True)
    how_to_use = models.CharField(_('How to use'),max_length=1024, blank=True)
    ingredients_highlight = models.CharField(_('Ingredients highlight'),max_length=1024, blank=True)
    ingredients = models.CharField(_('Ingredients'),max_length=1024, blank=True)
    forever_five_reasons = models.CharField(_('Forever five'), max_length=1024, blank=True)
    # for Shippo
    length = models.PositiveIntegerField(default=0)
    width = models.PositiveIntegerField(default=0)
    height = models.PositiveIntegerField(default=0)
    weight = models.FloatField(default=0)
    bottle_type = models.CharField(
        _('Bottle type'), max_length=32, blank=True, null=True)

    # A product can have at most one Rx item
    def get_rx_item(self):
        for product in self.get_all_products():
            if product.product_type == 'Rx':
                return product
        return None

    def get_products_in_set(self):
        products_in_set = []
        if self.is_set:
            product_sets = SetProduct.objects.filter(set_product=self)
            for product_set in product_sets:
                products_in_set.append(product_set.product_in_set)
        return products_in_set

    # If product is a set, include all items in products; o/w return itself (in a list)
    def get_all_products(self):
        products_in_set = self.get_products_in_set()
        if len(products_in_set) == 0:
            return [self]
        return products_in_set

    def get_kebab_case_name(self):
        return '-'.join(x for x in self.name.lower().split(' '))

    def is_trial(self):
        return self.product_type == Product.Type.rx and self == self.trial_product

    def has_refill_option(self):
        return self.refill_product != self.trial_product

    def save(self, *args, **kwargs):
        if not self.uuid:
            self.uuid = uuid5(uuid1(), self.name)
        return super().save(*args, **kwargs)
