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
from owner_ball.serializers import EntradaOwnerBallSerializer


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


# def listar_owner_ball_super_favorito(request, format=None):
#     dump_vw_mercado_owner_ball_sfHome_to_entrada_owner_ball()
    
#     page = request.GET.get('page', 1)
#     items_per_page = request.GET.get('items_per_page', 10)

#     try:
#         items_per_page = int(items_per_page)
#         if items_per_page > 50:
#             items_per_page = 50
#     except ValueError:
#         items_per_page = 10

#     entradas_owner_ball = EntradaOwnerBall.objects.all().order_by('id_event', 'data_jogo')
#     paginator = Paginator(entradas_owner_ball, items_per_page)
    
#     try:
#         paginator_entrada_sf_ob = paginator.page(page)
#     except PageNotAnInteger:
#         paginator_entrada_sf_ob = paginator.page(1)
#     except EmptyPage:
#         paginator_entrada_sf_ob = paginator.page(paginator.num_pages)
    
#     data = []
#     for entrada in paginator_entrada_sf_ob:
#         data.append({
#                 'id_event': entrada.id_event,
#                 'mercado': entrada.mercado,
#                 'odd': entrada.odd,
#                 'home_actual': entrada.home_actual,
#                 'away_actual': entrada.away_actual,
#                 'data_jogo': entrada.data_jogo.strftime('%Y-%m-%d %H:%M:%S') if entrada.data_jogo else None
#             })
        
#     return JsonResponse({
#             'success': True,
#             'mercados': data,
#             'pagination': {
#                 'current_page': paginator_entrada_sf_ob.number,
#                 'total_pages': paginator.num_pages,
#                 'items_per_page': items_per_page,
#                 'total_items': paginator.count
#             }
#         })

def listar_owner_ball_favorito_home(request):
    page = request.GET.get('page', 1)
    items_per_page = request.GET.get('items_per_page', 10)
    
    try:
        items_per_page = int(items_per_page)
        if items_per_page > 50:
            items_per_page = 50
    except ValueError:
        items_per_page = 10
    
    favoritos_home = VwMercadoOwnerBallFavoritoHome.objects.all().order_by('data_jogo')
    
    paginator = Paginator(favoritos_home, items_per_page)
    
    try:
        paginator_sf_ob = paginator.page(page)
    except PageNotAnInteger:
        paginator_sf_ob = paginator.page(1)
    except EmptyPage:
        paginator_sf_ob = paginator.page(paginator.num_pages)
    
    data = []
    for favorito_home in paginator_sf_ob:
        data.append({
                'id': favorito_home.id,
                'mercado': favorito_home.entrada_mercado,
                'odd': favorito_home.odd,
                'data_jogo': favorito_home.data_jogo.strftime('%Y-%m-%d %H:%M:%S') if favorito_home.data_jogo else None
            })
        
    return JsonResponse({
            'success': True,
            'mercados': data,
            'pagination': {
                'current_page': paginator_sf_ob.number,
                'total_pages': paginator.num_pages,
                'items_per_page': items_per_page,
                'total_items': paginator.count
            }
        })
    
    
def listar_owner_ball_under_2_5(request):
    page = request.GET.get('page', 1)
    items_per_page = request.GET.get('items_per_page', 10)
    
    try:
        items_per_page = int(items_per_page)
        if items_per_page > 50:
            items_per_page = 50
    except ValueError:
        items_per_page = 10
    
    under_2_5 = VwMercadoOwnerBallUnder2_5.objects.all().order_by('data_jogo')
    
    paginator = Paginator(under_2_5, items_per_page)
    
    try:
        paginator_under_2_5_ob = paginator.page(page)
    except PageNotAnInteger:
        paginator_under_2_5_ob = paginator.page(1)
    except EmptyPage:
        paginator_under_2_5_ob = paginator.page(paginator.num_pages)
    
    data = []
    for under_2_5 in paginator_under_2_5_ob:
        data.append({
                'id': under_2_5.id,
                'mercado': under_2_5.entrada_mercado,
                'odd': under_2_5.odd,
                'data_jogo': under_2_5.data_jogo.strftime('%Y-%m-%d %H:%M:%S') if under_2_5.data_jogo else None
            })
        
    return JsonResponse({
            'success': True,
            'mercados': data,
            'pagination': {
                'current_page': paginator_under_2_5_ob.number,
                'total_pages': paginator.num_pages,
                'items_per_page': items_per_page,
                'total_items': paginator.count
            }
        })
    