from rest_framework import serializers
    
class PlayerSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField(max_length=200)
    position= serializers.CharField(max_length=2)
    avg_rating = serializers.DecimalField(max_digits=3, decimal_places=2)
    team_id = serializers.IntegerField()
        
class DataSerializer(serializers.Serializer):
    home = PlayerSerializer(many=True)
    away = PlayerSerializer(many=True)
    
class LineupsSerializer(serializers.Serializer):
    success = serializers.BooleanField(read_only=True)
    message = serializers.CharField(required=False, allow_blank=True)
    data = DataSerializer()
    