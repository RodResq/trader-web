from django.contrib import admin
from lucro.models import Lucro

class ListandoLucro(admin.ModelAdmin):
    list_display = ("semana", "quantidade_apostas", "valor_inidividual_aposta", "data_inicial", "data_final") 
    list_display_links = ("semana",)
    search_fields = ("semana",)
    list_per_page = 10   
    
admin.site.register(Lucro, ListandoLucro)
# Register your models here.
