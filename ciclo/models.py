from django.db import models
from django.core.validators import MinValueValidator

class Ciclo(models.Model):
    CATEGORIA_CHOICE = [
        ("S", "Semanal"),
        ("Q", "Quinzenal"),
        ("M", "Mensal")
    ]
    
    categoria = models.CharField(max_length=20, blank=False, choices=CATEGORIA_CHOICE, default="S")
    saldo_atual = models.DecimalField(blank=False, max_digits=5, decimal_places=2)
    valor_disponivel_entrada = models.DecimalField(blank=False, max_digits=5, decimal_places=2)
    data_inicial = models.DateField(verbose_name="Data Inicial")
    data_final = models.DateField(verbose_name="Data Final")
    
    class Meta:
        managed = True
        db_table = 'ciclo'
        verbose_name = 'Ciclo'
        verbose_name_plural = 'Ciclo'
        ordering = ['-data_inicial']


class GerenciaCiclo(models.Model):
    ciclo = models.ForeignKey(Ciclo, db_column="id_ciclo", on_delete=models.CASCADE, null=True, blank=True, related_name="gerencia_ciclo", verbose_name="gerencia")
    qtd_total_entrada = models.IntegerField(blank=True, null=True, default=0)
    valor_total_entrada = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(0)], 
        verbose_name="Valor Total de Entrada", 
        default=0.0
    )
    valor_total_retorno = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(0)], 
        verbose_name="Valor Total de Retorno", 
        default=0.0
    )
    
    class Meta:
        managed = True
        db_table = 'gerencia_ciclo'
        verbose_name = 'GerenciaCiclo'
        verbose_name_plural = 'Gerencia Entrada'