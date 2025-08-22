from django.db import models
from django.core.validators import MinValueValidator
from ciclo.models import Ciclo

    
class VwMercadoOwnerBallSfHome(models.Model):
    id_event = models.BigIntegerField(null=False, name='id_event')
    mercado = models.CharField(max_length=200, name='mercado', db_collation='utf8mb4_0900_ai_ci', blank=True, null=True)
    odd = models.FloatField(blank=True, name='odd', null=True)
    home_actual = models.IntegerField(blank=True, name='home_actual', null=True)
    away_actual = models.IntegerField(blank=True, name='away_actual', null=True)
    data_jogo = models.DateTimeField(blank=True, name='data_jogo', null=True)
    class Meta:
        managed = False
        db_table = 'vw_mercado_owner_boll_super_favorito_home' 
        
    def __str__(self):
        return f"VwMercadoOwnerBallSfHome[entrada_mercado={self.entrada_mercado}, data_jogo={self.data_jogo}]"

        
class VwMercadoOwnerBallFavoritoHome(models.Model):
    entrada_mercado = models.CharField(max_length=200, db_collation='utf8mb4_0900_ai_ci', blank=True, null=True)
    odd = models.FloatField(blank=True, null=True)
    data_jogo = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'vw_mercado_owner_ball_favorito_home' 
        
    def __str__(self):
        return f"VwMercadoOwnerBallFavoritoHome[entrada_mercado={self.entrada_mercado}, data_jogo={self.data_jogo}]"
    

class VwMercadoOwnerBallUnder2_5(models.Model):
    entrada_mercado = models.CharField(max_length=200, db_collation='utf8mb4_0900_ai_ci', blank=True, null=True)
    odd = models.FloatField(blank=True, null=True)
    data_jogo = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'vw_mercado_owner_ball_under_2_5' 
        
    def __str__(self):
        return f"VwMercadoOwnerBallUnder2_5[entrada_mercado={self.entrada_mercado}, data_jogo={self.data_jogo}]"
    

class EntradaOwnerBall(models.Model):
    OPCOES_ENTRADA = [
        ("A", "aceitar"),
        ("R", "recusar"),
        ("E", "em_espera")
    ]
    
    ODD_CHANGE = [
        ('S', 'subiu'),
        ('D', 'desceu'),
        ('P', 'parada')
    ]
    
    id_event = models.IntegerField(primary_key=True)
    mercado = models.CharField(max_length=200, db_collation='utf8mb4_0900_ai_ci', blank=True, null=True)
    odd_change = models.CharField(max_length=5, blank=True, choices=ODD_CHANGE, default='P')
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
    resultado_estatistica = models.BooleanField(default=0)    
        
    def __str__(self):
        return f"EntradaOwnerBall - {self.id_event} - mercado: {self.mercado} - odd: {self.odd}"    
    
    
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
        db_table = "entrada_owner_ball"
        verbose_name = "entrada_owner_ball"
        verbose_name_plural = "entrada_owner_ball"
        ordering = ["-data_jogo"]
        

class IncomingOwnerBallFavoriteHome(models.Model):
    OPCOES_ENTRADA = [
        ("A", "aceitar"),
        ("R", "recusar"),
        ("E", "em_espera")
    ]
    ODD_CHANGE = [
        ('S', 'subiu'),
        ('D', 'desceu'),
        ('P', 'parada')
    ]
    RESULTADO_ENTRADA = [
        ("G", "ganhou"),
        ("E", "empatou"),
        ("P", "perdeu")
    ]
    id_event = models.IntegerField(primary_key=True)
    mercado = models.CharField(max_length=200, db_collation='utf8mb4_0900_ai_ci', blank=True, null=True)
    odd_change = models.CharField(max_length=5, blank=True, choices=ODD_CHANGE, default='P')
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
    resultado_estatistica = models.BooleanField(default=0)
    resultado_entrada = models.CharField(max_length=20, blank=False, choices=RESULTADO_ENTRADA, null=True)    
        
    def __str__(self):
        return f"EntradaOwnerBallFavoritoHome - {self.id_event} - mercado: {self.mercado} - odd: {self.odd}"    
    
    
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
        db_table = "icomming_owner_ball_favorite_home"
        verbose_name = "icomming_owner_ball_favorite_home"
        verbose_name_plural = "icomming_owner_ball_favorite_home"
        ordering = ["-data_jogo"]