from django.urls import path

from tournament.views import Tournaments

urlpatterns = [
    path('', Tournaments.as_view(), name='index'),
]