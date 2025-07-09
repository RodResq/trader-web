from django.urls import path, include
from .views import eventos, aceitar_aposta, verificar_ciclo, atualizar_odd_change

app_name = 'analytics'

urlpatterns = [
    path('gerencia/', include('gerencia.urls')),
    path('evento/', include('evento.urls')),
    path('ciclos/', include('ciclo.urls')),
    path('performace/', include('performace.urls')),
    path('apostas/aceitar/', aceitar_aposta, name='aceitar_aposta'),
    path('verificar_ciclo/', verificar_ciclo, name='verificar_ciclo'),
]
