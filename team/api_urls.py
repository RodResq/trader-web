from django.urls import path
from team.views import events, get_event, get_team, find_team, TeamList, TeamEvents

urlpatterns = [
    path('recuperar', get_team, name='get_team'),
    path('events', events, name="events"),
    path('event', get_event, name="get_event"),
    path('find', find_team, name="find_team"),
]

# API USANDO O REST FRAMEWORK
urlpatterns += [
    path('<int:id_team>', TeamEvents.as_view()),
    path('list', TeamList.as_view()),
]