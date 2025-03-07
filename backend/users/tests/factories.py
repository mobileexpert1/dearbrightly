from django.contrib.auth.models import Group
from factory import PostGenerationMethodCall, Sequence, SubFactory, post_generation
from factory.django import DjangoModelFactory
from users.models import User, ShippingDetails, MedicalProviderUser
from factory.faker import faker
from factory import LazyAttribute
from users.models import VacationDays

class ShippingDetailsFactory(DjangoModelFactory):
    class Meta:
        model = ShippingDetails
        
    phone = LazyAttribute(lambda _: faker.Faker().numerify("812#######"))

class UserFactory(DjangoModelFactory):
    class Meta:
        model = User

    email = Sequence(lambda n: f'user_{n}@dearbrightly.com')
    password = PostGenerationMethodCall('set_password', 'DearbrightlyGo')
    shipping_details = SubFactory(ShippingDetailsFactory)

    is_superuser = False
    is_staff = False
    is_active = True

    @post_generation
    def groups(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            for group in extracted:
                self.groups.add(group)


class GroupFactory(DjangoModelFactory):
    class Meta:
        model = Group

    name = 'Customers'


class MedicalProviderUserFactory(DjangoModelFactory):
    class Meta:
        model = MedicalProviderUser

    email = Sequence(lambda n: f'test_medical_provider_{n}@test.com')

    @post_generation
    def groups(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            for group in extracted:
                self.groups.add(group)

class VacationDaysFactory(DjangoModelFactory):
    class Meta:
        model = VacationDays
