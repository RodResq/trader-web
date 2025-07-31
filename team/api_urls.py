from django.urls import path
from .views import events, get_event

urlpatterns = [
    path('events', events, name="events"),
    path('event', get_event, name="get_event"),
]