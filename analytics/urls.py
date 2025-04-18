from django.urls import path, include
from .views import lucros, eventos, apostar

app_name = 'analytics'

urlpatterns = [
    path('lucros/', include('lucro.urls')),
    path('eventos/', eventos, name='eventos'),
    path('periodos/', include('periodo.urls')),
    path('apostar/<int:id_event>', apostar, name='apostar')
]
