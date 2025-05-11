from django.urls import path, include
from .views import eventos, aceitar_aposta, verificar_ciclo

app_name = 'analytics'

urlpatterns = [
    path('gerencia/', include('gerencia.urls')),
    path('eventos/', eventos, name='eventos'),
    path('ciclos/', include('ciclo.urls')),
    path('apostas/aceitar/', aceitar_aposta, name='aceitar_aposta'),
    path('verificar_ciclo/', verificar_ciclo, name='verificar_ciclo')
]
