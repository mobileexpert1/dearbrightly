from collections import OrderedDict
from rest_framework.relations import PKOnlyObject
from rest_framework.fields import SkipField
from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from rest_framework.exceptions import APIException, NotAuthenticated
from users.exceptions import InvalidFieldException
from users.models import MedicalProviderUser, User, ShippingDetails, UserOTPSettings
from users.validators.password_validators import validate_password
from users.validators.phone_number_validators import validate_phone_number_format, validate_unique_phone_number
from users.validators.postal_code_validators import validate_postal_code_length
from users.services import UserService
from utils.logger_utils import logger
from graphql_relay import to_global_id
from emr.types import UserType
from db_analytics.services import KlaviyoService
from django.utils import timezone
from orders.models import Order
from users.models import VacationDays
import hashlib

class ShippingDetailsSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()

    class Meta:
        model = ShippingDetails
        fields = (
            'id', 'address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country', 'phone', 'first_name',
            'last_name'
        )

    def validate_phone(self, phone):
        if phone:
            validate_phone_number_format(phone)
        return phone

    def validate_postal_code(self, postal_code):
        if not validate_postal_code_length(postal_code):
            error_message = f'Postal code must contain 5 digits.'
            logger.error(error_message)
            raise serializers.ValidationError(error_message)
        return postal_code

# TODO (Alda) - Consolidate with ShippingDetailsSerializer
class ShippingDetailsSerializerNoId(serializers.ModelSerializer):
    class Meta:
        model = ShippingDetails
        fields = (
            'address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country', 'phone', 'first_name',
            'last_name'
        )

    def validate_phone(self, phone):
        if phone:
            validate_phone_number_format(phone)
        return phone

    def validate_postal_code(self, postal_code):
        if not validate_postal_code_length(postal_code):
            error_message = f'Postal code must contain 5 digits.'
            logger.error(error_message)
            raise serializers.ValidationError(error_message)
        return postal_code

class UserOrderDataSerializer(serializers.Serializer):
    id = serializers.UUIDField(source='uuid')
    email = serializers.SerializerMethodField()
    shipping_details = ShippingDetailsSerializer('shipping_details', required=False, allow_null=True)

    def get_email(self, instance):
        return getattr(instance, 'email', None)

class MedicalProviderUserSerializer(serializers.ModelSerializer):
    global_id = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = MedicalProviderUser

        fields = (
            'global_id',
            'uuid',
            'full_name',
            'profile_photo_file'
        )

    def get_global_id(self, instance):
        return to_global_id(UserType._meta.name, instance.id)

    def get_full_name(self, instance):
        return instance.get_full_name()

class MedicalProviderUserStatesSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    states = serializers.ListField(
        child=serializers.CharField(max_length=2),
        allow_empty=True,
        required=True,
    )
    class Meta:
        model = MedicalProviderUser
        fields = ('id','full_name','states')

    def get_full_name(self, instance):
        return instance.get_full_name()

class UserSerializer(serializers.ModelSerializer):
    global_id = serializers.SerializerMethodField()
    # TODO - Rename id to uuid
    id = serializers.ReadOnlyField(source='uuid')
    is_medical_admin = serializers.ReadOnlyField()
    is_medical_provider = serializers.ReadOnlyField()
    is_plan_active = serializers.SerializerMethodField()
    password = serializers.CharField(required=False)
    reset_password_confirm = serializers.CharField(write_only=True, required=False)
    rx_status = serializers.ReadOnlyField()
    shipping_details = ShippingDetailsSerializer(required=False, read_only=True, allow_null=True)
    medical_provider = MedicalProviderUserSerializer(required=False, read_only=True, allow_null=True)
    otp_required = serializers.SerializerMethodField()
    otp_timeout_set = serializers.SerializerMethodField()
    two_factor_enabled = serializers.SerializerMethodField()
    facebook_user_id = serializers.ReadOnlyField()


    # TODO (Alda) - Take out of the serializer
    # dosespot_notifications_count = serializers.SerializerMethodField()
    # dosespot_notifications_sso_url = serializers.SerializerMethodField()

    class Meta:
        model = User

        fields = (
            'allow_sending_user_info_to_advertisers',
            'opt_in_sms_app_notifications',
            'date_joined',
            'dob',
            # 'dosespot_notifications_count',
            # 'dosespot_notifications_sso_url',
            'email',
            'gender',
            'id',
            'is_superuser',
            'is_medical_admin',
            'is_medical_provider',
            'first_name',
            'groups',
            'last_name',
            'is_plan_active',
            'medical_provider',
            'password',
            'payment_processor_customer_id',
            'require_payment_detail_update',
            'reset_password_confirm',
            'rx_status',
            'shipping_details',
            'global_id',
            'has_unread_messages',
            'otp_required',
            'otp_timeout_set',
            'two_factor_enabled',
            'facebook_user_id'
        )

        extra_kwargs = {'password': {'write_only': True}, }

    def validate(self, attrs):
        request = self.context.get("request")
        if request:
            validate_unique_phone_number(
                new_shipping_details=request.data.get("shipping_details"),
                current_shipping_details=self.instance.shipping_details,
                user_id=self.instance.id,
            )
        return super().validate(attrs)

    def get_two_factor_enabled(self, instance):
        try:
            user_otp_settings = instance.otp_settings
            return user_otp_settings.two_factor_enabled
        except UserOTPSettings.DoesNotExist:
            return False

    def get_otp_required(self, instance):
        try: 
            user_otp_settings = instance.otp_settings
            if user_otp_settings.two_factor_enabled:
                #logger.debug(f'[get_otp_required] Two-factor enabled: {user_otp_settings.two_factor_enabled}')
                # User did not set up otp session
                if not user_otp_settings.session_expire_datetime:
                    return True
                # User session expired 
                if user_otp_settings.session_expire_datetime and user_otp_settings.session_expire_datetime < timezone.now():
                    return True
            return False
        except UserOTPSettings.DoesNotExist:
            return False

    def get_otp_timeout_set(self, instance):
        try:
            user_otp_settings = instance.otp_settings
            if user_otp_settings.session_expire_datetime:
                return user_otp_settings.session_expire_datetime > timezone.now() 
            else:
                return False
        except UserOTPSettings.DoesNotExist:
            return False

    # This removes empty fields from the serialized output
    def to_representation(self, instance):
        """
        Object instance -> Dict of primitive datatypes.
        """
        ret = OrderedDict()
        fields = self._readable_fields

        for field in fields:
            try:
                attribute = field.get_attribute(instance)
            except SkipField:
                continue

            # KEY IS HERE:
            if attribute in [None, '']:
                continue

            # We skip `to_representation` for `None` values so that fields do
            # not have to explicitly deal with that case.
            #
            # For related fields with `use_pk_only_optimization` we need to
            # resolve the pk value.
            check_for_none = attribute.pk if isinstance(attribute, PKOnlyObject) else attribute
            if check_for_none is None:
                ret[field.field_name] = None
            else:
                ret[field.field_name] = field.to_representation(attribute)

        """ Exclude properties when reading """
        # ret = super().to_representation(instance)
        if (ret.get('password')):
            ret.pop('password')

        return ret

    def get_global_id(self, instance):
        return to_global_id(UserType._meta.name, instance.id)

    def get_dosespot_notifications_count(self, instance):
        from emr.services import DoseSpotService
        request = self.context.get('request')
        if request:
            if instance.is_medical_provider or instance.is_medical_admin:
                refill_requests_count, transaction_errors_count, pending_prescriptions_count = \
                    DoseSpotService().get_notifications_count(request=request)
                return transaction_errors_count
        return None

    def get_dosespot_notifications_sso_url(self, instance):
        from emr.services import DoseSpotService
        request = self.context.get('request')
        if request:
            if instance.is_medical_provider or instance.is_medical_admin:
                return DoseSpotService().generate_dosespot_sso_notifications_url(request=request)
        return None

    def get_is_plan_active(self, instance):
        return instance.is_plan_active()

    # TODO - Check if this is still actually used
    def get_orders(self, instance):
        return instance.orders.all().filter(purchased_datetime__isnull=False).count()

    def create(self, validated_data):
        if validated_data.get('shipping_details', None):
            shipping_details_data = validated_data.pop('shipping_details')
            logger.debug(f'Shipping details data: {shipping_details_data}')
            serializer = ShippingDetailsSerializer(shipping_details_data)
            serializer.is_valid(raise_exception=True)
            shipping_details = serializer.save()
            user = User.objects.create_user(shipping_details=shipping_details, **validated_data)
        else:
            user = User.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data, **kwargs):
        request = self.context.get('request', None)
        password = validated_data.get('password', None)
        password_reset_confirm = validated_data.get('reset_password_confirm', None)
        gender = validated_data.pop('gender') if validated_data.get('gender') else None
        dob = validated_data.get('dob') if validated_data.get('dob') else None

        if request:
            if not password:
                logger.debug(f'[update] User update request data: {request.data}')
        if dob:
            validated_data['dob'] = dob.isoformat()

        if password:
            if not password_reset_confirm:
                raise serializers.ValidationError('Password confirmation must be provided.')
            if not password_reset_confirm == password:
                raise serializers.ValidationError('Passwords do not match.')
            if validate_password(password) is None:
                validated_data['password'] = make_password(password)

        if request.data.get('shipping_details'):
            try:
                UserService().update_or_create_shipping_details(user=instance,
                                                                shipping_details_data=request.data.get('shipping_details'))
            except serializers.ValidationError as errors:
                error_msg = ''
                for key in errors.detail.keys():
                    for detail in errors.detail[key]:
                        error_msg += detail + ' '
                raise InvalidFieldException(detail=error_msg)

        # Previous gender values from the questionnaire are getting overwritten by None
        if gender:
            if gender != User.Gender.none:
                instance.gender = gender

        KlaviyoService().update_profile(instance)

        # TODO (Alda) - Uncomment once we get Surescripts certified and can push data to DoseSpot
        # if instance.dosespot_id:
        #     DoseSpotService().update_patient(request, instance)

        return super(UserSerializer,self).update(instance, validated_data)


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password_1 = serializers.CharField(write_only=True)
    new_password_2 = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs.get('old_password') == attrs.get('new_password_1'):
            error_message = 'New password must be different from your previous password'
            logger.error(error_message)
            raise serializers.ValidationError(error_message)

        if not attrs.get('new_password_1') == attrs.get('new_password_2'):
            error_message = 'Passwords do not match.'
            logger.error(error_message)
            raise serializers.ValidationError(error_message)

        if validate_password(attrs.get('new_password_1')) is None:
            return attrs


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def get_user(self, email):
        return User.objects.filter(email=email.lower()).exists()

    def validate(self, attrs):
        email = attrs.get('email')
        user = self.get_user(email)

        if not user:
            error_message = f'Unable to find user with given email address: {email}.'
            logger.error(error_message)
            raise serializers.ValidationError(error_message)

        return attrs


class KlaviyoShippingAddressSerializer(serializers.ModelSerializer):
    FirstName = serializers.ReadOnlyField(source='first_name')
    LastName = serializers.ReadOnlyField(source='last_name')
    Address1 = serializers.ReadOnlyField(source='address_line1')
    Address2 = serializers.ReadOnlyField(source='address_line2')
    City = serializers.ReadOnlyField(source='city')
    RegionCode = serializers.ReadOnlyField(source='state')
    Zip = serializers.ReadOnlyField(source='postal_code')
    # Country = serializers.ReadOnlyField(source='country.name')
    CountryCode = serializers.ReadOnlyField(source='country.code')
    Phone = serializers.ReadOnlyField(source='phone')

    class Meta:
        model = ShippingDetails
        fields = [
            'FirstName',
            'LastName',
            'Address1',
            'Address2',
            'City',
            'RegionCode',
            'Zip',
            # 'Country',
            'CountryCode',
            'Phone'
        ]

    # This removes empty fields from the serialized output
    def to_representation(self, instance):
        """
        Object instance -> Dict of primitive datatypes.
        """
        ret = OrderedDict()
        fields = self._readable_fields

        for field in fields:
            try:
                attribute = field.get_attribute(instance)
            except SkipField:
                continue

            # KEY IS HERE:
            if attribute in [None, '']:
                continue

            # We skip `to_representation` for `None` values so that fields do
            # not have to explicitly deal with that case.
            #
            # For related fields with `use_pk_only_optimization` we need to
            # resolve the pk value.
            check_for_none = attribute.pk if isinstance(attribute, PKOnlyObject) else attribute
            if check_for_none is None:
                ret[field.field_name] = None
            else:
                ret[field.field_name] = field.to_representation(attribute)

        return ret

class PaymentDetailsSerializer(serializers.Serializer):
    id = serializers.CharField()
    brand = serializers.CharField(required=False)
    exp_year = serializers.IntegerField()
    exp_month = serializers.IntegerField()
    last4 = serializers.CharField(min_length=4, max_length=4)

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        id = ret.pop("id", None)
        if id is not None:
            hashed_id = self.generate_hash(id)
            ret["id"] = hashed_id
        return ret

    def generate_hash(self, value):
        sha256_hash = hashlib.sha256()
        sha256_hash.update(str(value).encode("utf-8"))
        hashed_value = sha256_hash.hexdigest()
        return hashed_value

class VacationDaysSerializer(serializers.ModelSerializer):
    class Meta:
        model = VacationDays
        fields = ["id", "title", "medical_provider", "start_date", "end_date"]

