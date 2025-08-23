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
    

class SuperFavoriteHomeBallOwnerEntry(models.Model):
    ENTRY_OPTION = [
        ("A", "accept"),
        ("R", "refuse"),
        ("W", "wait")
    ]
    ODD_CHANGE = [
        ('U', 'up'),
        ('D', 'dow'),
        ('S', 'stop')
    ]
    ENTRY_RESULT = [
        ("W", "win"),
        ("D", "drow"),
        ("L", "lose")
    ]
    id_event = models.IntegerField(primary_key=True)
    market = models.CharField(max_length=200, db_collation='utf8mb4_0900_ai_ci', blank=True, null=True)
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
    event_date = models.DateTimeField(blank=True, null=True)
    entry_option = models.CharField(max_length=20, blank=False, choices=ENTRY_OPTION, default="W")
    statistic_result = models.BooleanField(default=0)
    entry_result = models.CharField(max_length=20, blank=False, choices=ENTRY_RESULT, null=True)     
        
    def __str__(self):
        return f"SuperFavoriteHomeBallOwnerEntry - {self.id_event} - market: {self.market} - odd: {self.odd}"    
    
    
    def save(self, *args, **kwargs):
        """
        Garante que entrada só seja atualizada se estiver dentro de um ciclo.
        """
        if self.event_date:            
            try:
                # Find a period that includes the game date
                Ciclo.objects.filter(
                    data_inicial__lte=self.event_date, 
                    data_final__gte=self.event_date
                ).first()
            except Ciclo.DoesNotExist:
                pass
            
        return super().save(*args, **kwargs)
    
    class Meta:
        db_table = "super_favorite_home_ball_owner_entry"
        verbose_name = "super_favorite_home_ball_owner_entry"
        verbose_name_plural = "super_favorite_home_ball_owner_entry"
        ordering = ["-event_date"]
        

class FavoriteHomeBallOwnerEntry(models.Model):
    ENTRY_OPTION = [
        ("A", "accept"),
        ("R", "refuse"),
        ("W", "wait")
    ]
    ODD_CHANGE = [
        ('U', 'up'),
        ('D', 'dow'),
        ('S', 'stop')
    ]
    ENTRY_RESULT = [
        ("W", "win"),
        ("D", "drow"),
        ("L", "lose")
    ]
    id_event = models.IntegerField(primary_key=True)
    market = models.CharField(max_length=200, db_collation='utf8mb4_0900_ai_ci', blank=True, null=True)
    odd_change = models.CharField(max_length=5, blank=True, choices=ODD_CHANGE, default='S')
    odd = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        validators=[MinValueValidator(0)], 
        verbose_name="Odd", 
        default=0.0
    )
    home_actual = models.IntegerField(blank=False, null=False, default=0)
    away_actual = models.IntegerField(blank=True, null=True, default=0)
    event_date = models.DateTimeField(blank=True, null=True)
    entry_option = models.CharField(max_length=20, blank=False, choices=ENTRY_OPTION, default="W")
    statistic_result = models.BooleanField(default=0)
    entry_result = models.CharField(max_length=20, blank=False, choices=ENTRY_RESULT, null=True)    
        
    def __str__(self):
        return f"FavoriteHomeBallOwnerEntry - {self.id_event} - market: {self.market} - odd: {self.odd}"    
    
    
    def save(self, *args, **kwargs):
        """
        Garante que entrada só seja atualizada se estiver dentro de um ciclo.
        """
        if self.event_date:            
            try:
                # Find a period that includes the game date
                Ciclo.objects.filter(
                    data_inicial__lte=self.event_date, 
                    data_final__gte=self.event_date
                ).first()
            except Ciclo.DoesNotExist:
                pass
            
        return super().save(*args, **kwargs)
    
    class Meta:
        db_table = "favorite_home_ball_owner_entry"
        verbose_name = "favorite_home_ball_owner_entry"
        verbose_name_plural = "favorite_home_ball_owner_entry"
        ordering = ["-event_date"]