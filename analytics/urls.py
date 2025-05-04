from django.urls import path, include
from .views import eventos, aceitar_aposta, entrada_multipla, verificar_ciclo

app_name = 'analytics'

urlpatterns = [
    path('gerencia/', include('gerencia.urls')),
    path('eventos/', eventos, name='eventos'),
    path('ciclos/', include('ciclo.urls')),
    # path('apostar/<int:id_event>', apostar, name='apostar')
    path('apostas/aceitar/', aceitar_aposta, name='aceitar_aposta'),
    path('entrada_multipla/', entrada_multipla, name='entrada_multipla'),
    path('verificar_ciclo/', verificar_ciclo, name='verificar_ciclo')
]
