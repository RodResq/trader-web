from django.urls import path
from .views import lucros, eventos

app_name = 'analytics'

urlpatterns = [
    path('lucros/', lucros, name='lucros'),
    path('eventos/', eventos, name='eventos')
]
