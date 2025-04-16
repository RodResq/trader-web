from django.db import models
from analytics.models import LittleFaith, Tournament

class Evento(models.Model):
    OPCAO_RESULTADOS = {
        "G": "green",
        "R": "red",
        "U": "undefined"
    }
    
    DIAS_SEMANA = {
        "DOMINGO": "domingo",
        "SEGUNDA": "segunda",
        "TERÇA": "terça",
        "QUARTA": "quarta",
        "QUINTA": "quinta",
        "SEXTA": "sexta",
        "SABADO": "sábado"
    }
    
    id_event = models.ForeignKey(LittleFaith, on_delete=models.CASCADE)
    id_campeonato = models.ForeignKey(Tournament, on_delete=models.DO_NOTHING) # mapear tabela tournament
    nome_campeonato = models.CharField(max_length=200, null=False)
    odd = models.DecimalField(blank=True, null=True, max_digits=5, decimal_places=2)
    resultado = models.CharField(max_length=1, choices=OPCAO_RESULTADOS)
    dia_semana = models.CharField(max_length=20, choices=DIAS_SEMANA)
    dia_evento = models.DateTimeField(blank=False, null=False)
    
    
    class Meta:
        managed = True
        db_table = 'evento'
    

