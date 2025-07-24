from django.db import models


class VwMercadoSuperFavoritoHome(models.Model):
    id_event = models.BigIntegerField()
    id_team_home = models.BigIntegerField()
    home_name = models.CharField(max_length=255, db_collation='utf8mb4_0900_ai_ci')
    id_team_away = models.BigIntegerField()
    away_name = models.CharField(max_length=255, db_collation='utf8mb4_0900_ai_ci')
    campeonato_name = models.CharField(max_length=255, db_collation='utf8mb4_0900_ai_ci')
    mercado_name = models.CharField(max_length=200, db_collation='utf8mb4_0900_ai_ci', blank=True, null=True)
    odd = models.FloatField()
    home_actual = models.BigIntegerField()
    away_actual = models.BigIntegerField()
    data_jogo = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'vw_mercado_super_favorito_home'
