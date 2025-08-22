from rest_framework import serializers
from owner_ball.models import EntradaOwnerBall, VwMercadoOwnerBallFavoritoHome, VwMercadoOwnerBallUnder2_5

class EntradaOwnerBallSerializer(serializers.ModelSerializer):
    class Meta:
        model = EntradaOwnerBall
        fields = ['id_event', 'mercado', 'odd', 'home_actual', 'away_actual', 'data_jogo']
        
        
class VwMercadoOwnerBallFavoritoHomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = VwMercadoOwnerBallFavoritoHome
        fields = ['id', 'entrada_mercado', 'odd', 'data_jogo']
        

class VwMercadoOwnerBallUnder2_5Serializer(serializers.ModelSerializer):
    class Meta:
        model = VwMercadoOwnerBallUnder2_5
        fields = ['id', 'entrada_mercado', 'odd', 'data_jogo']