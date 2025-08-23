from rest_framework import serializers
from owner_ball.models import SuperFavoriteHomeBallOwnerEntry, VwMercadoOwnerBallFavoritoHome, VwMercadoOwnerBallUnder2_5

class SuperFavoriteHomeBallOwnerEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = SuperFavoriteHomeBallOwnerEntry
        fields = ['id_event', 'entry_result', 'market', 'odd', 'home_actual', 'away_actual', 'event_date']
        
        
class VwMercadoOwnerBallFavoritoHomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = VwMercadoOwnerBallFavoritoHome
        fields = ['id', 'entrada_mercado', 'odd', 'data_jogo']
        

class VwMercadoOwnerBallUnder2_5Serializer(serializers.ModelSerializer):
    class Meta:
        model = VwMercadoOwnerBallUnder2_5
        fields = ['id', 'entrada_mercado', 'odd', 'data_jogo']