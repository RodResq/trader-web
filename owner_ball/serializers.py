from rest_framework import serializers
from django.db import models
from django.core.validators import MinValueValidator
from owner_ball.models import (
    SuperFavoriteHomeBallOwnerEntry, 
    VwMercadoOwnerBallFavoritoHome, 
    VwMercadoOwnerBallUnder2_5,
    CycleOwnerBall
)
from rest_framework.utils import timezone

class SuperFavoriteHomeBallOwnerEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = SuperFavoriteHomeBallOwnerEntry
        fields = [
            'id_event', 
            'entry_result', 
            'event_vote_home', 
            'entry_option', 
            'statistic_result', 
            'placar',
            'odd_change', 
            'odd', 
            'home_actual', 
            'away_actual', 
            'event_date',
            'id_home', 
            'name_home', 
            'icon_home',
            'id_away',
            'name_away',
            'icon_away'
        ]
        
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
        
        
class CycleOwnerBallSerializer(serializers.ModelSerializer):
    class Meta:
        model = CycleOwnerBall
        fields = ['category', 'start_date', 'end_date', 'current_balance', 'available_value']
    
    def validate_current_balance(self, value):
        if value <= 0:
            raise serializers.ValidationError("Valor atual deve ser positivo")
        return value
    
    def validate_available_value(self, value):
        if value <= 0:
            raise serializers.ValidationError("Valor disponível deve ser positivo")
        return value
    
    def validate(self, data):
        current_balance = data.get('current_balance')
        available_value = data.get('available_value')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if current_balance and available_value:
            if available_value > current_balance:
                raise serializers.ValidationError({
                    'available_value': 'Valor disponível não pode ser maior que o saldo atual'
                })
        
        if start_date and end_date:
            if end_date <= start_date:
                raise serializers.ValidationError({
                    'end_date': 'Data final deve ser posterior à data inicial'
                })
        
        return data
    
class CycleOwnerBallReadSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    start_date_formatted = serializers.SerializerMethodField()
    end_date_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = CycleOwnerBall
        fields = [
            'id', 'category', 'category_display', 
            'start_date', 'end_date', 'start_date_formatted', 'end_date_formatted', 
            'current_balance', 'available_value'
        ]
        
    def get_start_date_formatted(self, obj):
        return obj.start_date.strftime('%d/%m/%Y')
    
    def get_end_date_formatted(self, obj):
        return obj.end_date.strftime('%d/%m/%Y')
            
