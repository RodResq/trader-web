from owner_ball.models import VwMercadoOwnerBallSfHome, SuperFavoriteHomeBallOwnerEntry
from django.db import transaction

def dump_vw_mercado_owner_ball_sfHome_to_entrada_owner_ball() -> bool:
    markets = VwMercadoOwnerBallSfHome.objects.all()
    
    ids = SuperFavoriteHomeBallOwnerEntry.objects.values_list('id_event', flat=True)
    count_inputs = 0
    count_ignoreds = 0
    
    with transaction.atomic():
        for market in markets:
            if market.id_event not in ids:
                SuperFavoriteHomeBallOwnerEntry.objects.create(
                    id_event=market.id_event,
                    market=market.mercado,
                    odd=market.odd,
                    home_actual=market.home_actual,
                    away_actual=market.away_actual,
                    event_date=market.data_jogo
                )
                count_inputs += 1
            else:
                count_ignoreds += 1
    
    if count_inputs > 0:
        return True
    return False;
            