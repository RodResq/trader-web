from django.urls import path, include
from .views import lucros, eventos

app_name = 'analytics'

urlpatterns = [
    path('lucros/', lucros, name='lucros'),
    path('lucros/', include('lucro.urls')),
    path('eventos/', eventos, name='eventos')
]
