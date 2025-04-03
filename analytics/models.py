from django.db import models

# Create your models here.    

class VwAnalyticsMercadoV2(models.Model):
    # id = models.PositiveBigIntegerField()
    id_event = models.BigIntegerField()
    id_unique_tournament = models.BigIntegerField()
    id_season = models.BigIntegerField()
    id_home_team = models.BigIntegerField()
    id_away_team = models.BigIntegerField()

    class Meta:
        managed = False
        db_table = 'vw_analytics_mercado_v2'
