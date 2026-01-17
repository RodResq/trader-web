from django.urls import path
from .views import UniqueTournamentsList, get_icon_unique_tournament, UniqueTournaments

urlpatterns = [
    path('', UniqueTournamentsList.as_view(), name='unique_tournaments_list'),
    path('icon', get_icon_unique_tournament, name='get_icon_unique_tournament'),
    path('<int:id_unique>', UniqueTournaments.as_view(), name='unique_tournament'),
]