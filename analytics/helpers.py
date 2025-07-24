from .models import VwConsultaMercadoSf, Entrada, VwMercadoOwnerBallSfHome
from sofascore.models import VwMercadoSuperFavoritoHome
from django.db import transaction

def dump_mercados_para_entrada() -> bool:
    # mercados = VwConsultaMercadoSf.objects.all()
    mercados = VwMercadoSuperFavoritoHome.objects.all()
    
    id_existents = Entrada.objects.values_list('id_event', flat=True)
    contador_inseridos = 0
    contador_ignorados = 0
    
    with transaction.atomic():
        for mercado in mercados:
            if mercado.id_event not in id_existents:
                Entrada.objects.create(
                    id_event=mercado.id_event,
                    mercado=mercado.mercado,
                    odd=mercado.odd,
                    home_actual=mercado.home_actual,
                    away_actual=mercado.away_actual,
                    data_jogo=mercado.data_jogo
                )
                contador_inseridos += 1
            else:
                contador_ignorados += 1
    
    if contador_inseridos > 0:
        return True
    return False;
            
    