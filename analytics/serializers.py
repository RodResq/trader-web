from rest_framework import serializers
from rest_framework.utils import timezone
from analytics.models import Entrada


class EntryResultSuperFavoriteSerializer(serializers.Serializer):
    id_event = serializers.IntegerField(required=True)
    entry_result = serializers.CharField(required=True, max_length=1)
    
    def validate_entry_result(self, value):
        valid_results = ['W', 'L', 'D', 'P']
        if value not in valid_results:
            raise serializers.ValidationError(f"entry_result deve ser um de: {valid_results}")
        return value


class CustomResponseEntryResultSuperFavoriteSerializer(serializers.ModelSerializer):
    entry_result_display = serializers.SerializerMethodField()
    timestamp = serializers.SerializerMethodField()
        
    class Meta:
        model = Entrada
        fields = ['id_event', 'entry_result', 'entry_result_display', 'timestamp']
        
    def get_entry_result_display(self, obj):
        result_map = {
            'W': 'VITÓRIA',
            'L': 'DERROTA', 
            'D': 'EMPATE',
            'P': 'POSTERGADO'
        }
        return result_map.get(obj.entry_result, obj.entry_result)
    
    def get_timestamp(self, obj):
        return timezone.datetime.now()
        
