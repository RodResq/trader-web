from django.urls import path
from .views import get_icon_unique_tournament, UniqueTournaments

urlpatterns = [
    path('icon', get_icon_unique_tournament, name='get_icon_unique_tournament'),
    path('<int:id_unique>', UniqueTournaments.as_view(), name='unique_tournament'),
]