from django.contrib import admin
from gerencia.models import GerenciaCiclo

class ListandoGerencia(admin.ModelAdmin):
    list_display = ("qtd_total_entrada", "valor_total_entrada", "valor_total_retorno") 
    list_per_page = 10   
    
admin.site.register(GerenciaCiclo, ListandoGerencia)
# Register your models here.
