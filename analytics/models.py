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
        

class VwConsultaMercadoSf(models.Model):
    id_event = models.BigIntegerField(null=False)
    mercado = models.CharField(max_length=200, db_collation='utf8mb4_0900_ai_ci', blank=True, null=True)
    odd = models.FloatField(blank=True, null=True)
    home_actual = models.IntegerField(blank=True, null=True)
    away_actual = models.IntegerField(blank=True, null=True)
    data_jogo = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'vw_consulta_mercado_sf' 
        
    def __str__(self):
        return f"VwConsultaMercadoSf[id_event={self.id_event}, mercado={self.mercado}, data_jogo={self.data_jogo}]"
    
    
class LittleFaith(models.Model):
    id_event = models.IntegerField(primary_key=True)
    mercado = models.CharField(max_length=200, db_collation='utf8mb4_0900_ai_ci', blank=True, null=True)
    odd = models.FloatField(blank=True, null=True)
    home_actual = models.IntegerField(blank=True, null=True)
    away_actual = models.IntegerField(blank=True, null=True)
    data_jogo = models.DateTimeField(blank=True, null=True)
    
    def __str__(self):
        return f"LittleFaith - {self.id_event} - mercado: {self.mercado}"    
    
    
    class Meta:
        verbose_name = "Little Faith"
        verbose_name_plural = "Lucros"
        ordering = ["-data_jogo"]
    
    
    