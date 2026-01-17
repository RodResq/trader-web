from django.db import models


class UniqueTournament(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255)
    icon = models.TextField(blank=True, null=True, db_comment='Logo do time em base64 (estimativa: <65KB)')
    start_date_timestamp = models.DateTimeField(blank=True, null=True)
    end_date_timestamp = models.DateTimeField(blank=True, null=True)
    country_name = models.CharField(max_length=255, blank=True, null=True)
    id_team_title_holder = models.BigIntegerField(null=True)
    ids_teams_most_titles = models.CharField(max_length=255, blank=True, null=True, db_comment='Armazena os IDS dos times com mais titulos')
    has_rounds = models.BooleanField(null=True, default=False)
    has_groups = models.BooleanField(null=True, default=False)
    

    class Meta:
        managed = True
        db_table = 'unique_tournament'
