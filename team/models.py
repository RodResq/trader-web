from django.db import models


class TeamSofascore(models.Model):
    id_team = models.BigIntegerField(primary_key=True)
    name = models.CharField(max_length=255)
    ativo = models.SmallIntegerField()
    icon = models.TextField(blank=True, null=True, db_comment='Logo do time em base64 (estimativa: <65KB)')
    
    @property
    def icon_data_url(self):
        if self.icon:
            return f"data:image/png;base64,{self.icon}"
        return None
    
    @property
    def has_icon(self):
        return bool(self.icon)

    class Meta:
        managed = False
        db_table = 'team_sofascore'
        unique_together = (('id_team', 'name'),)
        
    def __str__(self):
        return self.name
        
class TeamPregameForm:
    def __init__(self, id_team, name, value):
        self.id_team = id_team
        self.name = name
        self.value = value
