from django.urls import path, include
from . import views

app_name = 'evento'

urlpatterns = [
    path('api/', include('evento.api_urls'))
]
