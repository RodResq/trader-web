from django.db import models

from team.models import TeamSofascore

class TeamSports(models.Model):
    id = models.BigIntegerField(primary_key=True)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=10)
    country = models.CharField(max_length=255)
    logo = models.URLField(max_length=500, blank=True, null=True)
    
    class Meta:
        managed = True
        db_table = 'team_sports'
        
    def __str__(self):
        return f"{self.name} ({self.code})"
        
class TeamSofascoreVsTeamSports(models.Model):
    sofascore_team = models.OneToOneField(
        TeamSofascore, 
        on_delete=models.CASCADE, 
        related_name='sofascore_mappings',
        primary_key=True)
    sports_team = models.OneToOneField(
        TeamSports, 
        on_delete=models.CASCADE, 
        related_name='sports_mappings')
    date_mapping = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    ativo= models.BooleanField(default=True)

    class Meta:
        managed = True
        db_table = 'team_sofascore_vs_team_sports'
        verbose_name = 'Mapeamento Sofascore-Sports'
        verbose_name_plural = 'Mapeamentos Sofascore-Sports'
        unique_together = (('sofascore_team', 'sports_team'),)
        indexes = [
            models.Index(fields=['sofascore_team', 'sports_team']),
        ]
        
    def __str__(self):
        return f"{self.sofascore_team.name} <-> {self.sports_team.name}"