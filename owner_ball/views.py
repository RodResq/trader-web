from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework.decorators import api_view 
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework import status
from owner_ball.models import (
    SuperFavoriteHomeBallOwnerEntry,
    VwMercadoOwnerBallFavoritoHome,
    VwMercadoOwnerBallUnder2_5)
from owner_ball.helpers import dump_vw_mercado_owner_ball_sfHome_to_entrada_owner_ball
from owner_ball.serializers import (
    SuperFavoriteHomeBallOwnerEntrySerializer, 
    VwMercadoOwnerBallFavoritoHomeSerializer, 
    VwMercadoOwnerBallUnder2_5Serializer,
    EntryResultSuperFavoriteHomeBallOwnerSerializer,
    CustomResponseEntryResultSuperFavoriteHomeBallOwnerSerializer    
)
from django.db import transaction
from shared.utils import CustomPagination
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
def listar_owner_ball_super_favorito(request, format=None):
    dump_vw_mercado_owner_ball_sfHome_to_entrada_owner_ball()
    super_favorites_home = SuperFavoriteHomeBallOwnerEntry.objects.all()
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
        
@api_view(['PUT'])
def resultado_entrada(request, format=None):
    serializer = EntryResultSuperFavoriteHomeBallOwnerSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({
            'success': False,
            'message': 'Parâmetros Invalidos.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
    validated_data = serializer.validated_data
    id_event = validated_data['id_event']
    entry_result = validated_data['entry_result']
    
    try:
        with transaction.atomic():
            super_favorites_home = get_object_or_404(SuperFavoriteHomeBallOwnerEntry, id_event=id_event)
            super_favorites_home.entry_result = entry_result
            super_favorites_home.save(update_fields=['entry_result'])
            
            response_serializer = CustomResponseEntryResultSuperFavoriteHomeBallOwnerSerializer(super_favorites_home,many=False)
            return Response({
                'success': True,
                'message': 'Resultado entrada atualizado com sucesso.',
                'data': response_serializer.data
            }, status=status.HTTP_200_OK)
    except ValueError:
        return Response({
           'success': False,
           'message': ' ID Evento deve ser um numero valido.' 
        }, status=status.HTTP_400_BAD_REQUEST)
    except SuperFavoriteHomeBallOwnerEntry.DoesNotExist:
        return Response({
            'success': False,
            'message': f'Entrada Super Favorito Home Owner Ball nao encontrada para o evento ID: {id_event}'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f'Erro ao atualizar resultado da entrada {id_event}: {str(e)}')
        return Response({
            'success': False,
            'message': 'Erro interno do servidor ao processar a solicitação.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)        
    