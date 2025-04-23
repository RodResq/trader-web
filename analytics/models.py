from django.db import models
from ciclo.models import CicloEntrada
from django.core.validators import MinValueValidator

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
    

class Tournament(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255)
    country_name = models.CharField(max_length=255, blank=True, null=True)
    ativo = models.SmallIntegerField()

    class Meta:
        managed = False
        db_table = 'tournament'
    
    
class Entrada(models.Model):
    OPCOES_ENTRADA = [
        ("A", "aceitar"),
        ("R", "recusar"),
        ("E", "em_espera")
    ]
    OPCOES_RESULTADO = [
        ("G", "green"),
        ("R", "red"),
        ("A", "anulado")
    ]
    id_event = models.IntegerField(primary_key=True)
    id_ciclo_entrada = models.ForeignKey(CicloEntrada, on_delete=models.CASCADE, null=True, blank=True, related_name="entradas", verbose_name="Período")
    mercado = models.CharField(max_length=200, db_collation='utf8mb4_0900_ai_ci', blank=True, null=True)
    odd = models.FloatField(blank=False, null=False, default=0.00)
    home_actual = models.IntegerField(blank=False, null=False, default=0)
    away_actual = models.IntegerField(blank=True, null=True, default=0)
    data_jogo = models.DateTimeField(blank=True, null=True)
    opcao_entrada = models.CharField(max_length=20, blank=False, choices=OPCOES_ENTRADA, default="E")
    valor = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(0)], 
        verbose_name="Valor de Entrada", 
        default=0.0
    )
    is_multipla = models.BooleanField(default=False, verbose_name="[0-simples, 1-multipla]")
    cod_multipla = models.CharField(max_length=20, blank=True, null=True)
    resultado_entrada = models.CharField(max_length=20, blank=True, null=True, choices=OPCOES_RESULTADO)
            
        
    def __str__(self):
        return f"Entrada - {self.id_event} - mercado: {self.mercado} - away_actual: {self.away_actual}"    
    
    
    def save(self, *args, **kwargs):
        """
        Automatically assigns the period based on data_jogo if not explicitly set
        """
        if not self.id_ciclo_entrada and self.data_jogo:
            try:
                # Find a period that includes the game date
                self.id_ciclo_entrada = CicloEntrada.objects.filter(
                    data_inicial__lte=self.data_jogo, 
                    data_final__gte=self.data_jogo
                ).first()
            except CicloEntrada.DoesNotExist:
                pass
            
        return super().save(*args, **kwargs)
    
    class Meta:
        db_table = "entrada"
        verbose_name = "entrada"
        verbose_name_plural = "Entrada"
        ordering = ["-data_jogo"]
        