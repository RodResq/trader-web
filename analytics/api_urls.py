from django.urls import path
from .views import aceitar_aposta, verificar_ciclo, editar_odd

urlpatterns = [
    path('editar_odd', editar_odd, name="editar_odd"),
    path('aceitar_aposta', aceitar_aposta, name='aceitar_aposta'),
    path('verificar_ciclo/', verificar_ciclo, name='verificar_ciclo'),
]