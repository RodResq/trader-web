from django.db import models
from django.core.validators import MinValueValidator

# Create your models here.

class Resultado(models.Model):
    semana = models.IntegerField(validators=[MinValueValidator(1)], verbose_name="Semana")
    quantidade_apostas = models.IntegerField(validators=[MinValueValidator(0)], verbose_name="Quantidade Apostas")
    valor_inidividual_aposta = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name="Valor Individual Aposta"
    )
    data_inicial = models.DateField(verbose_name="Data Inicial")
    data_final = models.DateField(verbose_name="Data Final")
    
    @property
    def valor_total_apostas(self):
        return self.quantidade_apostas * self.valor_inidividual_aposta
    
    def __str__(self):
        return f"Resultado - Semana {self.semana} ({self.data_inicial} e {self.data_final})"
    
    
    class Meta:
        db_table = "resultado"
        verbose_name = "Resultado"
        verbose_name_plural = "LucResultadoros"
        ordering = ["-semana"]
