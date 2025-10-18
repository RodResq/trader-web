from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.state import token_backend

from django.shortcuts import get_object_or_404
from django.db import transaction

from entrada.serializers import AceitarEntradaSerializer
from entrada.models import EventOriginEnum, EntryOptionEnum
from analytics.models import Entrada, Aposta
from ciclo.models import Ciclo
from owner_ball.models import SuperFavoriteHomeBallOwnerEntry, CycleOwnerBall, BetOwnerBall

from decimal import Decimal
    

class AceitarEntradaView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, event_id):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if auth_header and auth_header.startswith('Bearer '):
            token_string = auth_header.split(' ')[1]
            
            try:
                untyped_token = UntypedToken(token_string)
                payload = token_backend.decode(token_string, verify=True)
                
                print(f"Payload do JWT: {payload}")
                
                user_id = payload.get('user_id')
                groups = payload.get('groups', [])  
                
                print(f"User ID: {user_id}")
                print(f"Groups: {groups}")
            except Exception as e:
                return Response({
                    'success': False,
                    'message': f'Token inválido: {str(e)}'
                }, status=status.HTTP_401_UNAUTHORIZED)
        
        serializer = AceitarEntradaSerializer(data=request.data)
        if serializer.is_valid():
            validated_data = serializer.validated_data

            event_origin = validated_data['event_origin']
            valor_entrada = validated_data['valor_entrada']
            valor_retorno = validated_data['valor_retorno']
            
            try:
                if 'score-data' == event_origin:
                    entrada_score_data = get_object_or_404(Entrada, id_event=event_id)
                    ciclo = Ciclo.objects.filter(data_inicial__lte=entrada_score_data.data_jogo, data_final__gte=entrada_score_data.data_jogo).first()
                    aposta = Aposta.objects.filter(entrada__id_event=event_id).first()
                    
                    if not ciclo:
                        return Response({
                            'success': False,
                            'message': f'Não existe ciclo para a entrada.'
                        }, status=status.HTTP_400_BAD_REQUEST)
                        
                    if valor_entrada > ciclo.valor_disponivel_entrada:
                        return Response({
                            'success': False,
                            'message': f'Valor excede o disponível (R$ {ciclo.valor_disponivel_entrada})'
                        }, status=status.HTTP_400_BAD_REQUEST)
                    
                    with transaction.atomic():
                        if aposta:
                            aposta.valor = valor_entrada
                            aposta.retorno = valor_retorno
                            aposta.save()
                        else:
                            aposta = Aposta.objects.create(
                                entrada=entrada_score_data,
                                ciclo=ciclo,
                                is_multipla=False,
                                valor=valor_entrada,
                                retorno=valor_retorno
                            )
                        entrada_score_data.opcao_entrada = 'A'
                        entrada_score_data.save()
                        
                        ciclo.valor_disponivel_entrada -= Decimal(valor_entrada)
                        ciclo.save()
                        
                        return Response({
                            'success': True,
                            'message': 'Aposta aceita com sucesso',
                            'aposta_id': aposta.id
                        })
                elif 'owner-ball'== event_origin:
                    entry_owner_ball = get_object_or_404(SuperFavoriteHomeBallOwnerEntry, id_event=event_id)
                    cycle_owner_ball = CycleOwnerBall.objects.filter(start_date__lte=entry_owner_ball.event_date, end_date__gte=entry_owner_ball.event_date).first()
                    bet_owner_ball = BetOwnerBall.objects.filter(entry__id_event=event_id).first()
                    
                    return_check = self._check_cycle(cycle_owner_ball)
                    if return_check:
                        return return_check
                    
                    return_check_exceeds_availeble = self._check_exceeds_availeble(valor_entrada, cycle_owner_ball.available_value)
                    if return_check_exceeds_availeble:
                        return return_check_exceeds_availeble
                    
                    with transaction.atomic():
                        if bet_owner_ball:
                            bet_owner_ball.value_bet = valor_entrada
                            bet_owner_ball.return_bet = valor_retorno
                            bet_owner_ball.save()
                        else:
                            bet_owner_ball = BetOwnerBall.objects.create(
                                entry=entry_owner_ball,
                                cycle_owner_ball=cycle_owner_ball,
                                value_bet=valor_entrada,
                                return_bet=valor_retorno
                            )
                        entry_owner_ball.entry_option = 'A'
                        entry_owner_ball.save()
                        
                        cycle_owner_ball.available_value -= Decimal(valor_entrada)
                        cycle_owner_ball.save()
                        
                        return Response({
                            'success': True,
                            'message': 'Aposta Owner Ball Aceita Com Sucesso',
                            'aposta_id': bet_owner_ball.id
                        })
            except Exception as e:
                return Response({
                    'success': False,
                    'message': f'Erro ao processar aposta: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response({
                'success': False,
                'message': 'Dados inválidos',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
            
    def _check_cycle(self, cicle) -> Response:
        if not cicle:
            return Response({
                'success': False,
                'message': f'Não existe ciclo para a entrada.'
            }, status=status.HTTP_400_BAD_REQUEST)
        pass
    
    def _check_exceeds_availeble(self, entry_value, available_value) -> Response:
        if entry_value > available_value:
                return Response({
                    'success': False,
                    'message': f'Valor excede o disponível (R$ {available_value})'
                }, status=status.HTTP_400_BAD_REQUEST)
        pass
    

class RecusarEntradaView(APIView):
    
    def get(self, request, event_id):
        if not event_id:
            return Response({
                'success':False,
                'message': 'Parâmetros incompletos. É necessário fornecer event_id e action.'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            event_origin = request.GET.get('event_origin');
            if event_origin == EventOriginEnum.OWNER_BALL.value:
                entry_owner_ball = get_object_or_404(SuperFavoriteHomeBallOwnerEntry, id_event=event_id)
                entry_owner_ball.entry_option = EntryOptionEnum.REFUSE.value
                entry_owner_ball.save()
                
                return Response({
                    'success': True,
                    'message': 'Entrada Owner Ball Recusada',
                    'aposta_id': entry_owner_ball.id_event
                })
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Dados inválidos',
                'errors': e
            }, status=status.HTTP_400_BAD_REQUEST)
        
        
        