from django.urls import path
from . import api_views

urlpatterns = [
    path('proximo_evento/', api_views.proximo_evento, name='proximo_evento'),
    path('<int:id_event>/win_probability', api_views.win_probability, name='win_probability'),
]