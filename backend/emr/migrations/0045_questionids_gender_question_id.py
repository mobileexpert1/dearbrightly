# Generated by Django 2.0.5 on 2020-01-03 06:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('emr', '0044_auto_20200102_0039'),
    ]

    operations = [
        migrations.AddField(
            model_name='questionids',
            name='gender_question_id',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
    ]
