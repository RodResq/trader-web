from django.urls import path
from . import views

app_name = 'lucro'

urlpatterns = [
    path('', views.lucros, name='lucro_list'),
    # path('novo/', views.lucro_edit, name='lucro_create'),
    # path('editar/<int:pk>/', views.lucro_edit, name='lucro_edit'),
    # path('excluir/<int:pk>/', views.lucro_delete, name='lucro_delete'),
]