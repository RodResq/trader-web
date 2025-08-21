from rest_framework import serializers
from owner_ball.models import EntradaOwnerBall

class EntradaOwnerBallSerializer(serializers.ModelSerializer):
    class Meta:
        model = EntradaOwnerBall
        fields = ['id_event', 'mercado', 'odd', 'home_actual', 'away_actual', 'data_jogo']