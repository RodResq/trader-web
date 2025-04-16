from django.db import models
from analytics.models import LittleFaith

class Eventos(models.Model):
    OPCAO_RESULTADOS = {
        "G": "green",
        "R": "red",
        "U": "undefined"
    }
    
    DIAS_SEMANA = {
        "DOMINGO",
        "SEGUNDA",
        "TERÇA",
        "QUARTA",
        "QUINTA",
        "SEXTA",
        "SABADO"
    }
    
    id_event = models.ForeignKey(LittleFaith, on_delete=models.CASCADE)
    # id_campeonato = models.ForeignKey(Campeonato) # mapear tabela tournament
    nome_campeonato = models.CharField(max_length=200, null=False)
    odd = models.DecimalField(blank=True, null=True)
    resultado = models.CharField(max_length=1, choices=OPCAO_RESULTADOS)
    dia_semana = models.CharField(max_length=20, choices=DIAS_SEMANA)
    dia_evento = models.DateTimeField(blank=False, null=False)
    

