# Generated by Django 5.2 on 2025-04-18 11:06

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('analytics', '0014_alter_entrada_aposta_aceita'),
    ]

    operations = [
        migrations.RenameField(
            model_name='entrada',
            old_name='aposta_aceita',
            new_name='opcao_entrada',
        ),
    ]
