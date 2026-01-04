from rest_framework import serializers
from decimal import Decimal

class AceitarEntradaSerializer(serializers.Serializer):
    event_origin = serializers.CharField(required=True)
    valor_entrada = serializers.DecimalField(max_digits=4, decimal_places=2,required=True)
    valor_retorno = serializers.DecimalField(max_digits=10, decimal_places=4, min_value=Decimal("0.01"), required=True)
    
    def validate_valor_entrada(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                'O valor da entrada deve ser maior que zero.'
            )
        return value
    
    def validate(self, data):
        return data
    
    