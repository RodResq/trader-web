from django.urls import path
from . import views

app_name = 'gerencia'

urlpatterns = [
    path('', views.gerencia, name='index'),
    path('novo/', views.gerencia_edit, name='gerencia_create'),
    path('editar/<int:pk>/', views.gerencia_edit, name='gerencia_edit'),
    path('excluir/<int:pk>/', views.gerencia_delete, name='gerencia_delete'),
    path('resultado/', views.resultado, name="resultado")
]