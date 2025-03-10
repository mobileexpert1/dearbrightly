# Generated by Django 2.0.5 on 2023-01-30 09:59

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0054_auto_20230118_1338'),
    ]

    operations = [
        migrations.CreateModel(
            name='VacationDays',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_datetime', models.DateTimeField(default=django.utils.timezone.now)),
                ('last_modified_datetime', models.DateTimeField(auto_now=True)),
                ('title', models.CharField(default='Vacation', max_length=32, verbose_name='Title')),
                ('start_date', models.DateField()),
                ('end_date', models.DateField()),
                ('medical_provider', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='vacation_days', to='users.MedicalProviderUser')),
            ],
        ),
    ]
