from django.db import models
from ciclo.models import Ciclo
from django.core.validators import MinValueValidator
from decimal import Decimal

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
    
    
class VwMercadoOwnerBallSfHome(models.Model):
    entrada_mercado = models.CharField(max_length=200, db_collation='utf8mb4_0900_ai_ci', blank=True, null=True)
    odd = models.FloatField(blank=True, null=True)
    data_jogo = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'vw_mercado_owner_boll_sf_home' 
        
    def __str__(self):
        return f"VwMercadoOwnerBallSfHome[entrada_mercado={self.entrada_mercado}, data_jogo={self.data_jogo}]"
    

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
    
    id_event = models.IntegerField(primary_key=True)
    mercado = models.CharField(max_length=200, db_collation='utf8mb4_0900_ai_ci', blank=True, null=True)
    odd = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        validators=[MinValueValidator(0)], 
        verbose_name="Odd", 
        default=0.0
    )
    home_actual = models.IntegerField(blank=False, null=False, default=0)
    away_actual = models.IntegerField(blank=True, null=True, default=0)
    data_jogo = models.DateTimeField(blank=True, null=True)
    opcao_entrada = models.CharField(max_length=20, blank=False, choices=OPCOES_ENTRADA, default="E")
    
            
        
    def __str__(self):
        return f"Entrada - {self.id_event} - mercado: {self.mercado} - odd: {self.odd}"    
    
    
    def save(self, *args, **kwargs):
        """
        Garante que entrada só seja atualizada se estiver dentro de um ciclo.
        """
        if self.data_jogo:            
            try:
                # Find a period that includes the game date
                Ciclo.objects.filter(
                    data_inicial__lte=self.data_jogo, 
                    data_final__gte=self.data_jogo
                ).first()
            except Ciclo.DoesNotExist:
                pass
            
        return super().save(*args, **kwargs)
    
    class Meta:
        db_table = "entrada"
        verbose_name = "entrada"
        verbose_name_plural = "Entrada"
        ordering = ["-data_jogo"]
    
        
class Aposta(models.Model):
    """
    Modelo para representar apostas aceitas
    """
    RESULTADO_CHOICES = [
        ("G", "green"),
        ("R", "red"),
        ("A", "anulado"),
        ("", "selecione")
    ]
    
    entrada = models.ForeignKey(Entrada, on_delete=models.CASCADE, related_name='apostas')
    ciclo = models.ForeignKey(Ciclo, db_column="id_ciclo", on_delete=models.CASCADE, null=True, blank=True, related_name="aposta", verbose_name="ciclo")
    is_multipla = models.BooleanField(default=False, verbose_name="[0-simples, 1-multipla]")
    cod_multipla = models.CharField(max_length=20, blank=True, null=True)
    resultado = models.CharField(
        max_length=1,
        choices=RESULTADO_CHOICES,
        default=''
    )
    valor = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    retorno = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    data_aposta = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'aposta'
        verbose_name = 'Aposta'
        verbose_name_plural = 'Apostas'
        ordering = ['-data_aposta']
        
    def __str__(self):
        return f"Aposta #{self.id} - {self.evento.mercado}"
    
    def calcular_retorno(self):
        """
        Calcula o retorno da aposta baseado no resultado
        """
        if self.resultado == 'G':
            # Para apostas ganhas, o lucro é (odd - 1) * valor
            return (self.odd - 1) * self.valor
        elif self.resultado == 'R':
            # Para apostas perdidas, o lucro é negativo igual ao valor apostado
            return -self.valor
        else:
            # Para apostas canceladas ou aguardando, o lucro é zero
            return Decimal('0.00')