from django.urls import path
from entrada.views import AceitarEntradaView, RecusarEntradaView

urlpatterns = [
    path('<int:event_id>/aceitar', AceitarEntradaView.as_view(), name='aceitar-entrada'),
    path('<int:event_id>/recusar', RecusarEntradaView.as_view(), name='recusar-entrada')
]