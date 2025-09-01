from rest_framework import serializers
from analytics.models import Entrada

class SuperFavoriteHomeScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Entrada
        fields = '__all__'