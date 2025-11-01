from django.db import models
from django.core.validators import MinValueValidator
from ciclo.models import Ciclo

from decimal import Decimal

    
class VwMercadoOwnerBallSfHome(models.Model):
    id_event = models.BigIntegerField(null=False, name='id_event')
    placar = models.CharField(max_length=200, db_collation='utf8mb4_0900_ai_ci', blank=True, null=True)
    odd = models.FloatField(blank=True, name='odd', null=True)
    home_actual = models.IntegerField(blank=True, name='home_actual', null=True)
    away_actual = models.IntegerField(blank=True, name='away_actual', null=True)
    data_jogo = models.DateTimeField(blank=True, name='data_jogo', null=True)
    id_home =  models.IntegerField(null=False, name='id_home')
    home_name = models.CharField(max_length=255, db_collation='utf8mb4_0900_ai_ci', blank=True, null=True)
    home_icon = models.TextField(db_collation='utf8mb4_0900_ai_ci', blank=True, null=True)
    id_away =  models.IntegerField(null=False, name='id_away')
    away_name = models.CharField(max_length=255, db_collation='utf8mb4_0900_ai_ci', blank=True, null=True)
    away_icon = models.TextField(db_collation='utf8mb4_0900_ai_ci', blank=True, null=True)
    
    class Meta:
        managed = False
        db_table = 'vw_mercado_owner_boll_super_favorito_home' 
        
    @property
    def icon_home_data_url(self):
        if self.home_icon:
            return f"data:image/png;base64,{self.home_icon}"
        return None
    
    @property
    def icon_away_data_url(self):
        if self.away_icon:
            return f"data:image/png;base64,{self.away_icon}"
        return None
        
    def __str__(self):
        return f"VwMercadoOwnerBallSfHome[placar={self.placar}, data_jogo={self.data_jogo}]"

        
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
        ("L", "lose"),
        ("P", "Postponed")
    ]
    VOTACAO = [
        ("H", 'home'),
        ("A", 'away'),
        ("N", 'none')
    ]
    id_event = models.IntegerField(primary_key=True)
    placar = models.CharField(max_length=200, db_collation='utf8mb4_0900_ai_ci', blank=True, null=True)
    odd_change = models.CharField(max_length=5, blank=True, choices=ODD_CHANGE, default='P')
    odd = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        validators=[MinValueValidator(0)], 
        verbose_name="Odd", 
        default=0.0
    )
    home_actual = models.IntegerField(blank=False, null=False, default=0)
    home_win = models.IntegerField(blank=False, null=False, default=0)
    away_actual = models.IntegerField(blank=True, null=True, default=0)
    away_win = models.IntegerField(blank=True, null=True, default=0)
    draw_probability = models.IntegerField(blank=True, null=True, default=0)
    event_date = models.DateTimeField(blank=True, null=True)
    entry_option = models.CharField(max_length=20, blank=False, choices=ENTRY_OPTION, default="W")
    statistic_result = models.BooleanField(default=0)
    entry_result = models.CharField(max_length=20, blank=False, choices=ENTRY_RESULT, null=True)
    event_vote_home = models.CharField(max_length=20, blank=False, choices=VOTACAO, default="N")   
    icon_home = models.TextField(db_collation='utf8mb4_0900_ai_ci', blank=True, null=True)
    id_home = models.IntegerField(null=True)
    name_home = models.CharField(max_length=255, db_collation='utf8mb4_0900_ai_ci', blank=True, null=True)
    icon_away = models.TextField(db_collation='utf8mb4_0900_ai_ci', blank=True, null=True)
    id_away = models.IntegerField(null=True)
    name_away = models.CharField(max_length=255, db_collation='utf8mb4_0900_ai_ci', blank=True, null=True)
        
    class Meta:
        db_table = "super_favorite_home_ball_owner_entry"
        verbose_name = "super_favorite_home_ball_owner_entry"
        verbose_name_plural = "super_favorite_home_ball_owner_entry"
        ordering = ["-event_date"]
        
    def __str__(self):
        return f"SuperFavoriteHomeBallOwnerEntry - {self.id_event} - placar: {self.placar} - odd: {self.odd}"    
    
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
        
    class Meta:
        db_table = "favorite_home_ball_owner_entry"
        verbose_name = "favorite_home_ball_owner_entry"
        verbose_name_plural = "favorite_home_ball_owner_entry"
        ordering = ["-event_date"]
        
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
    
        
class CycleOwnerBall(models.Model):
    CATEGORY_CHOICE = [
        ("W", "Weekly"),
        ("B", "Biweekly"),
        ("M", "Monthly")
    ]
    
    category = models.CharField(max_length=20, blank=False, choices=CATEGORY_CHOICE, default="W")
    current_balance = models.DecimalField(blank=False, max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    available_value = models.DecimalField(blank=False, max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    start_date = models.DateField(verbose_name="Start Date")
    end_date = models.DateField(verbose_name="End Date")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    
    class Meta:
        managed = True
        db_table = 'cycle_owner_ball'
        verbose_name = 'Cycle Owner Ball'
        verbose_name_plural = 'Cycle Owner Ball'
        ordering = ['-start_date']
        constraints = [
            models.CheckConstraint(
                check=models.Q(end_date__gt=models.F('start_date')),
                name='end_date_after_start_date'
            ),
            models.CheckConstraint(
                check=models.Q(available_value__lte=models.F('current_balance')),
                name='available_value_not_greater_than_balance'
            )
        ]
        
    def __str__(self):
        return f"CycleOwnerBall #{self.id}, category: {self.category}, current_balance: {self.current_balance}, start_date: {self.start_date}, end_date: {self.end_date}"
        
        
class BetOwnerBall(models.Model):
    RESULT_CHOICES = [
        ("G", "Green"),
        ("R", "Red"),
        ("C", "Canceled"),
        ("", "selecione")
    ]
    
    entry = models.ForeignKey(SuperFavoriteHomeBallOwnerEntry, on_delete=models.CASCADE, related_name='bets_owner_ball')
    cycle_owner_ball = models.ForeignKey(CycleOwnerBall, db_column="id_cycle", on_delete=models.CASCADE, null=True, blank=True, related_name="bet_owner_ball", verbose_name="cycle")
    is_multiple = models.BooleanField(default=False, verbose_name="[0-simple, 1-multiple]")
    cod_multiple = models.CharField(max_length=20, blank=True, null=True)
    result = models.CharField(
        max_length=1,
        choices=RESULT_CHOICES,
        default=''
    )
    value_bet = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    return_bet = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    date_bet = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'bet_owner_ball'
        verbose_name = 'BetOwnerBall'
        verbose_name_plural = 'BetsOwnerBall'
        ordering = ['-id']
        
    def __str__(self):
        return f"BetOwnerBall #{self.id} - {self.entry.market}"
    
    def calculete_return_bet(self):
        if self.result == 'G':
            return (self.entry.odd - 1) * self.value_bet
        elif self.resultado == 'R':
            # TODO REFATORA, POIS JA FOI SUBTRAIDO DO DISPONIVEL
            return -self.value_bet
        else:
            # Para apostas canceladas ou aguardando, o lucro é zero
            return Decimal('0.00')
        
        
class CycleManagerOwnerBall(models.Model):
    cycle = models.ForeignKey(CycleOwnerBall, db_column="id_ciclo", on_delete=models.CASCADE, related_name="cycle_manager_owner_ball", verbose_name="cycle_manager_owner_ball")
    total_entries_number = models.IntegerField(blank=True, null=True, default=0)
    total_entries_value = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(0)], 
        verbose_name="Valor Total de Entrada", 
        default=0.0
    )
    total_return_value = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(0)], 
        verbose_name="Valor Total de Retorno", 
        default=0.0
    )
    
    class Meta:
        managed = True
        db_table = 'cycle_manager_owner_ball'
        verbose_name = 'CycleManagerOwnerBall'
        verbose_name_plural = 'Cycle Manager Owner Ball'