from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import ugettext_lazy as _
from .forms import CustomUserChangeForm, CustomUserCreationForm
from users.models import User

class UserAdmin(BaseUserAdmin):
    """Define admin model for custom User model with no email field."""

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser',
                                       'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
    )
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'shipping_details_first_name', 'shipping_details_last_name',
                    'shipping_details_address_line1', 'shipping_details_address_line2', 'shipping_details_city',
                    'shipping_details_postal_code', 'shipping_details_state', 'shipping_details_phone')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)

    def shipping_details_first_name(self, obj):
        if not obj.shipping_details:
            return None
        return obj.shipping_details.first_name
    def shipping_details_last_name(self, obj):
        if not obj.shipping_details:
            return None
        return obj.shipping_details.last_name
    def shipping_details_address_line1(self, obj):
        if not obj.shipping_details:
            return None
        return obj.shipping_details.address_line1
    def shipping_details_address_line2(self, obj):
        if not obj.shipping_details:
            return None
        return obj.shipping_details.address_line2
    def shipping_details_city(self, obj):
        if not obj.shipping_details:
            return None
        return obj.shipping_details.city
    def shipping_details_postal_code(self, obj):
        if not obj.shipping_details:
            return None
        return obj.shipping_details.postal_code
    def shipping_details_state(self, obj):
        if not obj.shipping_details:
            return None
        return obj.shipping_details.state
    def shipping_details_phone(self, obj):
        if not obj.shipping_details:
            return None
        return obj.shipping_details.phone



admin.site.register(User, UserAdmin)
