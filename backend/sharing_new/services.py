import logging
from typing import Optional, Dict, Union

from sharing.models import Sharing
from sharing.serializers import SharingSerializer
from users.models import User

logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
logger = logging.getLogger(__name__)


class SharingService:
    def get_referral_code(
        self, serializer: SharingSerializer, user: User
    ) -> Dict[str, Union[int, str]]:
        serializer.is_valid(raise_exception=True)
        referrer = self._get_referrer(
            user=user, email=serializer.validated_data["referrer_email"]
        )
        code = Sharing.get_code(
            referrer=referrer,
            entry_point=serializer.validated_data["entry_point"],
            communication_method=serializer.validated_data["communication_method"],
            email_type=serializer.validated_data["email_type"],
            email_reminder_interval_in_days=serializer.validated_data[
                "email_reminder_interval_in_days"
            ],
        )
        return {
            "communication_method": serializer.validated_data["communication_method"],
            "code": code,
        }

    @staticmethod
    def _get_referrer(user: User, email: str) -> Optional[User]:
        if not user.is_anonymous:
            return user
        elif email:
            try:
                return User.objects.get(email=email)
            except User.DoesNotExist:
                logger.error(
                    f"[get_referral_code] User with email {email} does not exist."
                )
        return None
