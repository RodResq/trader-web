from django.urls import path
from . import api_views

urlpatterns = [
    path('proximo_evento/', api_views.proximo_evento, name='proximo_evento'),
]