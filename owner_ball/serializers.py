from rest_framework import serializers
from owner_ball.models import EntradaOwnerBall, VwMercadoOwnerBallFavoritoHome

class EntradaOwnerBallSerializer(serializers.ModelSerializer):
    class Meta:
        model = EntradaOwnerBall
        fields = ['id_event', 'mercado', 'odd', 'home_actual', 'away_actual', 'data_jogo']
        
        
class VwMercadoOwnerBallFavoritoHomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = VwMercadoOwnerBallFavoritoHome
        fields = ['id', 'entrada_mercado', 'odd', 'data_jogo']