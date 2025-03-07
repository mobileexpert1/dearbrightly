from django.db import models


class Reporter(models.Model):
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    extra = models.TextField()

    def get_full_name(self):
        return f'{self.first_name} {self.last_name}'


class Article(models.Model):
    headline = models.CharField(max_length=100)
    reporter = models.ForeignKey(
        Reporter, on_delete=models.CASCADE, related_name="articles"
    )
