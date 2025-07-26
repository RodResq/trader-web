from django.urls import path, include
from .views import eventos, aceitar_aposta, verificar_ciclo, atualizar_odd_change, index

app_name = 'analytics'

urlpatterns = [
    path('', index, name='index'),
]
