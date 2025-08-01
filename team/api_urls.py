from django.urls import path
from .views import events, get_event, get_team

urlpatterns = [
    path('recuperar', get_team, name='get_team'),
    path('events', events, name="events"),
    path('event', get_event, name="get_event"),
]