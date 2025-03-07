from django.contrib.auth.base_user import BaseUserManager
from django.db import models

from users.validators.password_validators import validate_password

class UserManager(BaseUserManager):
    """
    Define a model manager for User model with no username field.
    """
    def _set_user_password(self, user, password):
        if validate_password(password) is None:
            user.set_password(password)
            user.save()
        return user

    def _create_user(self, email, password, is_staff, is_superuser, **extra_fields):
        new_extra_fields = dict()
        for key in extra_fields:
            if key in ('phone'):
                continue
            new_extra_fields[key] = extra_fields[key]
        email = self.normalize_email(email)

        user = self.model(email=email, password=password, is_staff=is_staff,
                          is_superuser=is_superuser, **new_extra_fields)
        if password:
            return self._set_user_password(user, password)

        user.save()
        return user

    def create_user(self, email, password=None, is_staff=False, is_superuser=False, **extra_fields):
        return self._create_user(email, password, is_staff, is_superuser, **extra_fields)

    def create_superuser(self, email, password, is_staff=True, is_superuser=True, **extra_fields):
        return self._create_user(email, password, is_staff, is_superuser, **extra_fields)

    def active_users(self):
        return self.model.objects.all().exclude(is_active=False)


class PasswordResetManager(models.Manager):
    def create(self, user):
        self.model.objects.filter(user=user).delete()
        return super().create(user=user)
