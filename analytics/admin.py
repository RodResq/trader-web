from django.contrib import admin
from analytics.models import Entrada


class ListandoLitleFaith(admin.ModelAdmin):
    list_display = ("id_event", "mercado", "odd", "home_actual", "away_actual", "data_jogo") 
    list_display_links = ("id_event", "mercado")
    search_fields = ("mercado",)
    list_per_page = 10   

admin.site.register(Entrada, ListandoLitleFaith)