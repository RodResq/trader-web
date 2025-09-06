from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.state import token_backend

from django.shortcuts import get_object_or_404
from django.db import transaction

from entrada.serializers import AceitarEntradaSerializer
from analytics.models import Entrada, Aposta
from ciclo.models import Ciclo

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
                if 'score_data' == event_origin:
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