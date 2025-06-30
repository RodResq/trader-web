from django.urls import path, include
from . import views

app_name = 'performace'

urlpatterns = [
    path('api/', include('performace.api_urls')),
]
