from django.db import models

class Prediction(models.Model):
    id_fixture = models.BigIntegerField(primary_key=True)
    id_winner = models.BigIntegerField()
    name_winner = models.CharField(max_length=255)
    comment = models.CharField(max_length=255)
    win_or_draw = models.BooleanField()
    advice = models.CharField(max_length=255)
    home_percent = models.CharField(max_length=50)
    draw_percent = models.CharField(max_length=50)
    away_percent = models.CharField(max_length=50)
    id_league = models.BigIntegerField()
    id_home = models.BigIntegerField()
    id_away = models.BigIntegerField()
    
    class Meta:
        managed = True
        db_table = 'prediction'
        
