from django.db import models
from django_countries.fields import CountryField
from datetime import datetime

class League(models.Model):
    id = models.BigIntegerField(primary_key=True)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=50)
    logo = models.URLField(max_length=500, blank=True, null=True)
    country_name = models.CharField(max_length=100)
    coyntry_code = CountryField()
    country_flag = models.URLField(max_length=500, blank=True, null=True)
    season_year = models.PositiveIntegerField(default=datetime.now().year)
    season_start = models.DateField()
    season_end = models.DateField()
    season_coverege_predictions = models.BooleanField(default=False, help_text="Possui Predictions")
    
    class Meta:
        managed = True
        db_table = 'league'
    
