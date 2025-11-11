from analytics.models import Entrada
from score_data.models import VwMercadoSuperFavoritoHome
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
                    id_home=mercado.id_team_home,
                    icon_home_data_url=mercado.icon_home_data_url,
                    name_home=mercado.name_home,
                    id_away=mercado.id_team_away,
                    icon_away_data_url=mercado.icon_away_data_url,
                    name_away=mercado.name_away,
                    mercado=mercado.mercado_name,
                    odd=mercado.odd,
                    home_actual=mercado.home_actual,
                    home_vote=0,
                    away_actual=mercado.away_actual,
                    away_vote=0,
                    data_jogo=mercado.data_jogo
                )
                contador_inseridos += 1
            else:
                contador_ignorados += 1
    
    if contador_inseridos > 0:
        return True
    return False;
            
    