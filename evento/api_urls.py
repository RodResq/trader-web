from django.urls import path
from evento.api_views import proximo_evento, win_probability, LineupComparationView


urlpatterns = [
    path('proximo_evento/', proximo_evento, name='proximo_evento'),
    path('<int:id_event>/win_probability', win_probability, name='win_probability'),
    path('<int:id_event>/compare_players', LineupComparationView.as_view())
]