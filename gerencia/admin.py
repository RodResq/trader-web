from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html
from gerencia.models import GerenciaCiclo

@admin.register(GerenciaCiclo)
class ListandoGerencia(admin.ModelAdmin):
    
    @admin.display(description="Id Ciclo")
    def link_para_ciclo(self, obj):
        if obj.ciclo:
            url = reverse(
                f'admin:{obj.ciclo._meta.app_label}_{obj.ciclo._meta.model_name}_change',
                args=[obj.ciclo.id]
            )
            
            return format_html('<a href="{}">{}</a>', url, obj.ciclo.id)
        return "-" 
    
    list_display = ("link_para_ciclo", "qtd_total_entrada", "valor_total_entrada", "valor_total_retorno") 
    list_select_related = ('ciclo',)
    list_per_page = 10   
