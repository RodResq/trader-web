# Generated by Django 5.2 on 2025-04-12 16:34

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='VwAnalyticsMercadoV2',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('id_event', models.BigIntegerField()),
                ('id_unique_tournament', models.BigIntegerField()),
                ('id_season', models.BigIntegerField()),
                ('id_home_team', models.BigIntegerField()),
                ('id_away_team', models.BigIntegerField()),
            ],
            options={
                'db_table': 'vw_analytics_mercado_v2',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='VwConsultaMercadoSf',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('mercado', models.CharField(blank=True, db_collation='utf8mb4_0900_ai_ci', max_length=200, null=True)),
                ('odd', models.FloatField(blank=True, null=True)),
                ('home_actual', models.IntegerField(blank=True, null=True)),
                ('away_actual', models.IntegerField(blank=True, null=True)),
                ('data_jogo', models.DateTimeField(blank=True, null=True)),
            ],
            options={
                'db_table': 'vw_consulta_mercado_sf',
                'managed': False,
            },
        ),
    ]
