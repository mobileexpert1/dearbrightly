from django.db import models
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _

class FeatureFlag(models.Model):
    name = models.CharField(_('Feature Flag Name'), max_length=128, unique=True)
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField(auto_now=False, null=True)

    @staticmethod
    def is_enabled(feature_flag_name):
        try:
            feature_flag = FeatureFlag.objects.get(name__iexact=feature_flag_name)
        except FeatureFlag.DoesNotExist:
            return False

        current_time = timezone.now()
        if feature_flag.end_date:
            if feature_flag.start_date <= current_time < feature_flag.end_date:
                return True
        elif feature_flag.start_date <= current_time:
            return True

        return False


    def save(self, **kwargs) -> None:
        self.name = self.name.lower()
        return super().save(**kwargs)