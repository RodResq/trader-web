from rest_framework import serializers
from team.models import TeamSofascore, TeamPregameForm

class TeamSofascoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamSofascore
        fields = ['id_team', 'name', 'icon', 'icon_data_url']
        
    def get_icon_data_url(self, obj):
        if obj.icon:
            return obj.icon.url if hasattr(obj.icon, 'url') else str(obj.icon)
        return None



class TeamPregameFormSerializer(serializers.Serializer):
    id_team = serializers.IntegerField()
    name = serializers.CharField(max_length=200)
    value = serializers.DecimalField(max_digits=3, decimal_places=2)

