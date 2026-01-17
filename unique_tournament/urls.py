from django.urls import path, include
from .views import unique_tournaments_render

app_name = 'unique-tournaments'

urlpatterns = [
    path('', unique_tournaments_render, name='index')
]
