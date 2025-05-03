from django.urls import path, include
from .views import eventos, aceitar_aposta

app_name = 'analytics'

urlpatterns = [
    path('gerencia/', include('gerencia.urls')),
    path('eventos/', eventos, name='eventos'),
    path('ciclos/', include('ciclo.urls')),
    # path('apostar/<int:id_event>', apostar, name='apostar')
    path('apostas/aceitar/', aceitar_aposta, name='aceitar_aposta')
]
