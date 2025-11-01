from rest_framework import serializers


class WinProbabilitySerializer(serializers.Serializer):
    home_win = serializers.IntegerField(read_only=True, default=0)
    away_win = serializers.IntegerField(read_only=True, default=0)
    draw = serializers.IntegerField(read_only=True, default=0)

class WinProbabilitySerializerSuccess(serializers.Serializer):
    success = serializers.BooleanField(read_only=True)
    data = WinProbabilitySerializer(required=False, allow_blank=True)
    message = serializers.CharField(required=True, allow_blank=True)
    
    