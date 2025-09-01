import logging

from rest_framework.generics import ListAPIView
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated

from analytics.models import Entrada, Aposta, OddChange
from market.serializers import SuperFavoriteHomeScoreSerializer

from shared.utils import CustomPaginationSuperFavorite

logger = logging.getLogger(__name__)


class SuperFavoriteHomeScore(ListAPIView):
    queryset = Entrada.objects.all();
    serializer_class = SuperFavoriteHomeScoreSerializer
    authentication_classes = [SessionAuthentication, BasicAuthentication]
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPaginationSuperFavorite
