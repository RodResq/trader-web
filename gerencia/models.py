from django.db import models
from django.core.validators import MinValueValidator
from ciclo.models import Ciclo
from datetime import date

# Create your models here.
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
        
        
class EvolucaoSaldoAtual(models.Model):
    id_ciclo = models.ForeignKey(Ciclo, db_column="id_ciclo", on_delete=models.CASCADE, null=True, blank=True, related_name="evolucao_saldo_atual", verbose_name="ciclo")
    saldo = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(0)], 
        verbose_name="Valor do Saldo Atual", 
        default=0.0
    )
    disponivel_entrada = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(0)], 
        verbose_name="Valor Disponivel Entrada", 
        default=0.0
    )
    data = models.DateField(verbose_name="Data da Alterção do sado inicial", default=date.today)
    
    class Meta:
        managed = True
        db_table = 'evolucao_saldo_atual'
        verbose_name = 'Evolução Saldo Atual'
        verbose_name_plural = 'Evoluçao dos Saldos Atuais'
        constraints = [
            models.UniqueConstraint(
                fields=['id_ciclo', 'data'],
                name='unique_ciclo_data'
            )
        ]
        