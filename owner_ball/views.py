from django.shortcuts import render
from django.http import JsonResponse
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from rest_framework.decorators import api_view 
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from owner_ball.models import (
    VwMercadoOwnerBallFavoritoHome,
    VwMercadoOwnerBallUnder2_5)
from owner_ball.helpers import dump_vw_mercado_owner_ball_sfHome_to_entrada_owner_ball
from owner_ball.models import EntradaOwnerBall
from owner_ball.serializers import EntradaOwnerBallSerializer, VwMercadoOwnerBallFavoritoHomeSerializer , VwMercadoOwnerBallUnder2_5Serializer

class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'items_per_page'
    max_page_size = 50
    page_query_param = 'page'
    
    def get_paginated_response(self, data):
        return Response({
            'success': True,
            'mercados': data,
            'pagination': {
                'current_page': self.page.number,
                'total_pages': self.page.paginator.num_pages,
                'items_per_page': self.page.paginator.per_page,
                'total_items': self.page.paginator.count,
                'has_next': self.page.has_next(),
                'has_previous': self.page.has_previous(),
            }
        })


@api_view(['GET'])
def listar_owner_ball_super_favorito(request, format=None):
    dump_vw_mercado_owner_ball_sfHome_to_entrada_owner_ball()
    entradas_owner_ball = EntradaOwnerBall.objects.all().order_by('id_event', 'data_jogo')
    paginator = CustomPagination()
    paginated_queryset = paginator.paginate_queryset(entradas_owner_ball, request)
    serializer = EntradaOwnerBallSerializer(paginated_queryset, many=True)
    
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
def listar_owner_ball_favorito_home(request, format=None):
    favoritos_home = VwMercadoOwnerBallFavoritoHome.objects.all().order_by('data_jogo')
    paginator = CustomPagination()
    paginator_queryset = paginator.paginate_queryset(favoritos_home, request)
    serializer = VwMercadoOwnerBallFavoritoHomeSerializer(paginator_queryset, many=True)
    
    return paginator.get_paginated_response(serializer.data)
    

@api_view(['GET'])
def listar_owner_ball_under_2_5(request, format=None):
    under_25 = VwMercadoOwnerBallUnder2_5.objects.all().order_by('data_jogo')
    paginator = CustomPagination()
    paginator_queryset = paginator.paginate_queryset(under_25, request)
    serializer = VwMercadoOwnerBallUnder2_5Serializer(paginator_queryset, many=True)
    
    return paginator.get_paginated_response(serializer.data)
        