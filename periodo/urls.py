from django.urls import path
from . import views

app_name = 'periodo'

urlpatterns = [
    path('', views.periodos, name='index'),
    path('novo/', views.periodo_edit, name='periodo_create'),
    path('editar/<int:pk>/', views.periodo_edit, name='periodo_edit'),
    path('excluir/<int:pk>/', views.periodo_delete, name='periodo_delete'),
]
