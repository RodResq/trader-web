from django.contrib import admin
from django.utils.formats import date_format
from analytics.models import Entrada


@admin.register(Entrada)
class ListandoLitleFaith(admin.ModelAdmin):
    
    @admin.display(description="data_jogo")
    def data_jogo_formatada(self, obj):
        if obj.data_jogo:
            return date_format(obj.data_jogo, format='d/m/Y')
        return '-'
            
    
    list_display = ("id_event", "mercado", "odd", "home_actual", "away_actual", "valor", "data_jogo_formatada", "opcao_entrada", "ciclo") 
    list_editable = ("opcao_entrada", "ciclo", )
    list_display_links = ("id_event", "mercado")
    search_fields = ("mercado",)
    list_per_page = 10   

