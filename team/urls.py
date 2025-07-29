from django.urls import path, include
from . import views

app_name = 'team'

urlpatterns = [
    path('', views.teams, name='index'),
    # path('api/', include('team.api_urls'))
    
]