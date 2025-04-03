from django.db import models

# Create your models here.

class MercadoSuperFavorito(models.Model):
    entrada = models.CharField(max_length=200, null=False, blank=False)
    odd = models.DecimalField(db_index=2)
    home_fractional = models.DecimalField(db_index=2)
    away_fractional = models.DecimalField(db_index=2)
    
    def __str__(self):
        return f"MercadoSuperFavorito [entrada={self.entrada}]"
