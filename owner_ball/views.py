from django.shortcuts import render
from django.http import JsonResponse
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from analytics.models import (
    VwMercadoOwnerBallSfHome,
    VwMercadoOwnerBallFavoritoHome,
    VwMercadoOwnerBallUnder2_5)


def listar_owner_ball_super_favorito(request):
    page = request.GET.get('page', 1)
    items_per_page = request.GET.get('items_per_page', 10)
    
    try:
        items_per_page = int(items_per_page)
        if items_per_page > 50:
            items_per_page = 50
    except ValueError:
        items_per_page = 10
    
    
    sfs_owner_ball = VwMercadoOwnerBallSfHome.objects.all().order_by('id_event', 'data_jogo')
    
    paginator = Paginator(sfs_owner_ball, items_per_page)
    
    try:
        paginator_sf_ob = paginator.page(page)
    except PageNotAnInteger:
        paginator_sf_ob = paginator.page(1)
    except EmptyPage:
        paginator_sf_ob = paginator.page(paginator.num_pages)
    
    data = []
    for sf in paginator_sf_ob:
        # TODO IMPLEMENTAR CHAMADA A API http://127.0.0.1:8080/statistic-overall PARA ATUALIAR O VALOR NA TELA
        data.append({
                'id_event': sf.id_event,
                'mercado': sf.mercado,
                'odd': sf.odd,
                'home_actual': sf.home_actual,
                'away_actual': sf.away_actual,
                'data_jogo': sf.data_jogo.strftime('%Y-%m-%d %H:%M:%S') if sf.data_jogo else None
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
    