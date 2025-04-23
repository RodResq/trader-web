from django.contrib import admin
from gerencia.models import Resultado

class ListandoLucro(admin.ModelAdmin):
    list_display = ("semana", "quantidade_apostas", "total_entradas", "total_retorno", "data_inicial", "data_final") 
    list_display_links = ("semana",)
    search_fields = ("semana",)
    list_per_page = 10   
    
admin.site.register(Resultado, ListandoLucro)
# Register your models here.
