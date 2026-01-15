from django.urls import path

from tournament.views import UniqueTournaments

urlpatterns = [
    path('', UniqueTournaments.as_view(), name='index'),
    
]