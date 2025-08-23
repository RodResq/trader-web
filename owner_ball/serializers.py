from rest_framework import serializers
from owner_ball.models import SuperFavoriteHomeBallOwnerEntry, VwMercadoOwnerBallFavoritoHome, VwMercadoOwnerBallUnder2_5
from rest_framework.utils import timezone

class SuperFavoriteHomeBallOwnerEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = SuperFavoriteHomeBallOwnerEntry
        fields = ['id_event', 'entry_result', 'market', 'odd', 'home_actual', 'away_actual', 'event_date']
        
class EntryResultSuperFavoriteHomeBallOwnerSerializer(serializers.Serializer):
    id_event = serializers.IntegerField(required=True)
    entry_result = serializers.CharField(required=True, max_length=1)
    
    def validate_entry_result(self, value):
        valid_results = ['W', 'L', 'D']
        if value not in valid_results:
            raise serializers.ValidationError(f"entry_result deve ser um de: {valid_results}")
        return value
    
class CustomResponseEntryResultSuperFavoriteHomeBallOwnerSerializer(serializers.ModelSerializer):
    entry_result_display = serializers.SerializerMethodField()
    timestamp = serializers.SerializerMethodField()
        
    class Meta:
        model = SuperFavoriteHomeBallOwnerEntry
        fields = ['id_event', 'entry_result', 'entry_result_display', 'timestamp']
        
    def get_entry_result_display(self, obj):
        result_map = {
            'W': 'VITÓRIA',
            'L': 'DERROTA', 
            'D': 'EMPATE'
        }
        return result_map.get(obj.entry_result, obj.entry_result)
    
    def get_timestamp(self, obj):
        return timezone.datetime.now()
    
class VwMercadoOwnerBallFavoritoHomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = VwMercadoOwnerBallFavoritoHome
        fields = ['id', 'entrada_mercado', 'odd', 'data_jogo']
        

class VwMercadoOwnerBallUnder2_5Serializer(serializers.ModelSerializer):
    class Meta:
        model = VwMercadoOwnerBallUnder2_5
        fields = ['id', 'entrada_mercado', 'odd', 'data_jogo']