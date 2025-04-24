from django.db import models
from django.core.validators import MinValueValidator
from ciclo.models import Ciclo

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