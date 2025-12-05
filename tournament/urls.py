from django.urls import path, include
from tournament.views import Tournaments

app_name = 'tournaments'

urlpatterns = [
    path('', Tournaments.as_view(), name='index')
]
