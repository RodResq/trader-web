from django.contrib import admin
from django.utils.formats import date_format
from ciclo.models import Ciclo

# Register your models here.
@admin.register(Ciclo)
class ListandoCiclo(admin.ModelAdmin):
    
    @admin.display(description="data_inicial")
    def data_inicial_formatada(self, obj):
        if obj.data_inicial or obj.data_final:
            return date_format(obj.data_inicial, format='d/m/Y')
        return '-'
    
    @admin.display(description="data_final")
    def data_final_formatada(self, obj):
        if obj.data_final:
            return date_format(obj.data_final, format='d/m/Y')
        return '-'
        
        
    list_display = ("categoria", "saldo_atual", "valor_disponivel_entrada", "data_inicial_formatada", "data_final_formatada")
    
