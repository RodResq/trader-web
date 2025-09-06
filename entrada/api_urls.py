from django.urls import path
from entrada.views import AceitarEntradaView

urlpatterns = [
    path('<int:event_id>/aceitar', AceitarEntradaView.as_view(), name='aceitar-entrada')
]