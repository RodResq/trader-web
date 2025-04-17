# Generated by Django 5.2 on 2025-04-17 17:50

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Periodo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('categoria', models.CharField(choices=[('S', 'semanal'), ('Q', 'quinzenal'), ('M', 'mensal')], default='semanal', max_length=20)),
                ('saldo_atual', models.DecimalField(decimal_places=2, max_digits=5)),
                ('disponivel_entrada', models.DecimalField(decimal_places=2, max_digits=5)),
                ('data_inicial', models.DateField(verbose_name='Data Inicial')),
                ('data_final', models.DateField(verbose_name='Data Final')),
            ],
            options={
                'db_table': 'periodo',
                'managed': True,
            },
        ),
    ]
