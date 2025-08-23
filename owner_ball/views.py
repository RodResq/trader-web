from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework.decorators import api_view 
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from owner_ball.models import (
    SuperFavoriteHomeBallOwnerEntry,
    VwMercadoOwnerBallFavoritoHome,
    VwMercadoOwnerBallUnder2_5)
from owner_ball.helpers import dump_vw_mercado_owner_ball_sfHome_to_entrada_owner_ball
from owner_ball.serializers import SuperFavoriteHomeBallOwnerEntrySerializer, VwMercadoOwnerBallFavoritoHomeSerializer , VwMercadoOwnerBallUnder2_5Serializer

class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'items_per_page'
    max_page_size = 50
    page_query_param = 'page'
    
    def get_paginated_response(self, data):
        return Response({
            'success': True,
            'markets': data,
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
    super_favorites_home = SuperFavoriteHomeBallOwnerEntry.objects.all().order_by('id_event', 'event_date')
    paginator = CustomPagination()
    paginated_queryset = paginator.paginate_queryset(super_favorites_home, request)
    serializer = SuperFavoriteHomeBallOwnerEntrySerializer(paginated_queryset, many=True)
    
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
def listar_owner_ball_favorito_home(request, format=None):
    favorites_home = VwMercadoOwnerBallFavoritoHome.objects.all().order_by('data_jogo')
    paginator = CustomPagination()
    paginator_queryset = paginator.paginate_queryset(favorites_home, request)
    serializer = VwMercadoOwnerBallFavoritoHomeSerializer(paginator_queryset, many=True)
    
    return paginator.get_paginated_response(serializer.data)
    

@api_view(['GET'])
def listar_owner_ball_under_2_5(request, format=None):
    under_25 = VwMercadoOwnerBallUnder2_5.objects.all().order_by('data_jogo')
    paginator = CustomPagination()
    paginator_queryset = paginator.paginate_queryset(under_25, request)
    serializer = VwMercadoOwnerBallUnder2_5Serializer(paginator_queryset, many=True)
    
    return paginator.get_paginated_response(serializer.data)
        
        
        
def resultado_entrada(request):
    if request.method == 'GET':
        event_id = request.GET.get('event_id')
        resultado_entrada = request.GET.get('resultado_entrada')
        
        if not event_id:
            return JsonResponse({
                'success': False,
                'message': 'Parâmetros incompletos. É necessário fornecer event_id.'
            }, status=400)
            
        try:
                         
            entrada = get_object_or_404(SuperFavoriteHomeBallOwnerEntry, id_event=event_id)
            entrada.resultado_entrada = resultado_entrada
            entrada.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Resultado entrada registrado com sucesso!',
                'data': {
                    'id_event': entrada.id_event,
                    'resultado_entrada': entrada.resultado_entrada
                }
            })
        except ValueError:
            return JsonResponse({
                'success': False,
                'message': 'Resultado inválido. Reveja o ID ou o resultado.'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'sucess':False,
                'message': f'Erro ao registrar a entrada: {str(e)}'
            }, status=500)