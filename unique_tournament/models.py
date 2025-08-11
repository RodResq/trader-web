from django.db import models


class UniqueTournament(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255)
    icon = models.TextField(blank=True, null=True, db_comment='Logo do time em base64 (estimativa: <65KB)')

    class Meta:
        managed = False
        db_table = 'unique_tournament'
