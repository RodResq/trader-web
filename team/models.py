from django.db import models


class TeamSofascore(models.Model):
    id_team = models.BigIntegerField(primary_key=True)
    name = models.CharField(max_length=255)
    ativo = models.SmallIntegerField()
    icon = models.TextField(blank=True, null=True, db_comment='Logo do time em base64 (estimativa: <65KB)')

    class Meta:
        managed = False
        db_table = 'team_sofascore'
        unique_together = (('id_team', 'name'),)
