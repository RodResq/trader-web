from django.urls import path
from .views import get_icon_unique_tournament

urlpatterns = [
    path('icon', get_icon_unique_tournament, name='get_icon_unique_tournament'),
]