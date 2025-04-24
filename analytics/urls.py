from django.urls import path, include
from .views import eventos, apostar

app_name = 'analytics'

urlpatterns = [
    path('gerencia/', include('gerencia.urls')),
    path('eventos/', eventos, name='eventos'),
    path('ciclos/', include('ciclo.urls')),
    path('apostar/<int:id_event>', apostar, name='apostar')
]
