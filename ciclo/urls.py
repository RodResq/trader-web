from django.urls import path
from . import views

app_name = 'ciclo'

urlpatterns = [
    path('', views.ciclos, name='index'),
    path('novo/', views.ciclo_edit, name='ciclo_create'),
    path('editar/<int:pk>/', views.ciclo_edit, name='ciclo_edit'),
    path('excluir/<int:pk>/', views.ciclo_delete, name='ciclo_delete'),
]
