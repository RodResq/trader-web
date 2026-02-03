from django.db import models


class VwMercadoSuperFavoritoHome(models.Model):
    id_event = models.BigIntegerField()
    id_team_home = models.BigIntegerField()
    name_home = models.CharField(max_length=255, db_collation='utf8mb4_0900_ai_ci')
    icon_home = models.TextField(db_collation='utf8mb4_0900_ai_ci', blank=True, null=True)
    id_team_away = models.BigIntegerField()
    name_away = models.CharField(max_length=255, db_collation='utf8mb4_0900_ai_ci')
    icon_away = models.TextField(db_collation='utf8mb4_0900_ai_ci', blank=True, null=True)
    id_tournament = models.IntegerField(blank=True, null=True)
    campeonato_name = models.CharField(max_length=255, db_collation='utf8mb4_0900_ai_ci')
    country_name = models.CharField(max_length=255, blank=True, null=True)
    mercado_name = models.CharField(max_length=200, db_collation='utf8mb4_0900_ai_ci', blank=True, null=True)
    odd = models.FloatField()
    home_actual = models.BigIntegerField()
    away_actual = models.BigIntegerField()
    data_jogo = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'vw_mercado_super_favorito_home'
        
    @property
    def icon_home_data_url(self):
        if self.icon_home:
            return f"data:image/png;base64,{self.icon_home}"
        return None
    
    @property
    def has_icon_home(self):
        return bool(self.icon_home)
    
    @property
    def icon_away_data_url(self):
        if self.icon_away:
            return f"data:image/png;base64,{self.icon_away}"
        return None
    
    @property
    def has_icon_away(self):
        return bool(self.icon_away)
