from django.urls import path
from ia.views import AnalisePartidaAPIView

urlpatterns = [
    path('analisar-partida', AnalisePartidaAPIView.as_view())
]