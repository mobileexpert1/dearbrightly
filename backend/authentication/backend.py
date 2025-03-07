from django.contrib.auth import get_user_model
from utils.logger_utils import logger
from django.contrib.auth.backends import ModelBackend

UserModel = get_user_model()

class SocialOauthAuthenticationBackend(ModelBackend):

    def authenticate(self, email=None):
        try:
            user = UserModel._default_manager.get_by_natural_key(email)
        except UserModel.DoesNotExist:
            return None
        else:
            if self.user_can_authenticate(user):
                return user
        return None






