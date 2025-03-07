# Generated by Django 2.0.5 on 2020-02-27 02:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sharing', '0004_auto_20200220_1953'),
    ]

    operations = [
        migrations.AlterField(
            model_name='sharing',
            name='email_type',
            field=models.IntegerField(choices=[(0, 'none'), (1, 'unknown'), (2, 'sign up'), (3, 'empty cart'), (4, 'abandoned cart'), (5, 'incomplete questionnaire'), (6, 'incomplete photos'), (7, 'incomplete photo id'), (8, 'order cancelation skin profile expired'), (9, 'skin profile completion new user'), (10, 'skin profile completion returning user'), (11, 'order shipped trial'), (12, 'order shipped'), (13, 'order tracking update'), (14, 'order arrived'), (15, 'provider message'), (16, 'user check in'), (17, 'upcoming subscription order rx updated new user'), (18, 'upcoming subscription order rx unchanged new sser'), (19, 'upcoming subscription order rx updated returning user'), (20, 'upcoming subscription order rx unchanged returning user'), (21, 'user annual visit'), (22, 'payment failure'), (23, 'order confirmation ship now'), (24, 'order confirmation resume'), (25, 'order confirmation'), (26, 'sharing program')], default=0, verbose_name='email type'),
        ),
    ]
