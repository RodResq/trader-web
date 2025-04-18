from django.db import models

class Periodo(models.Model):
    CATEGORIA_CHOICE = [
        ("S", "Semanal"),
        ("Q", "Quinzenal"),
        ("M", "Mensal")
    ]
    
    categoria = models.CharField(max_length=20, blank=False, choices=CATEGORIA_CHOICE, default="S")
    saldo_atual = models.DecimalField(blank=False, max_digits=5, decimal_places=2)
    disponivel_entrada = models.DecimalField(blank=False, max_digits=5, decimal_places=2)
    data_inicial = models.DateField(verbose_name="Data Inicial")
    data_final = models.DateField(verbose_name="Data Final")
    
    class Meta:
        managed = True
        db_table = 'periodo'
        verbose_name = 'Período'
        verbose_name_plural = 'Períodos'
        ordering = ['-data_inicial']
