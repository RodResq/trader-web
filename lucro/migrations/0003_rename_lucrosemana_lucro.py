# Generated by Django 5.2 on 2025-04-12 17:03

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('lucro', '0002_rename_lucro_lucrosemana'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='LucroSemana',
            new_name='Lucro',
        ),
    ]
