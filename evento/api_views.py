from decimal import Decimal
from django.views import View
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.http import require_http_methods
from django.db.models.functions import Abs
from django.db.models import F, Q

from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import NotFound

from datetime import timedelta

from analytics.models import Entrada
from shared.enums import EventOriginEnum

from dataclasses import dataclass, asdict

from owner_ball.models import SuperFavoriteHomeBallOwnerEntry

from .serializers import LineupsSerializer
from .services import ApiService, LineupComparationService

import requests



@api_view(['GET'])
def win_probability(request, id_event):
    if not id_event:
        return Response({
            'sucess': False,
            'message': 'ID Event passado como paramentro'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    event_origin = request.query_params.get('event_origin')
    if not event_origin:
        return Response({
            'sucess': False,
            'message': 'Event Orgin nao informado'
        }, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        api_base_url = "http://127.0.0.1:8080"
        response = requests.get(
            f'{api_base_url}/event/{id_event}/win_probability', 
            timeout=5
        )
        if response.status_code == status.HTTP_200_OK:
            data = response.json()
            
            if not data['success']:
                return Response(data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            home_win_data = data['data']['home_win']
            away_win_data = data['data']['away_win']
            draw_data = data['data']['draw']
            
            home_win = home_win_data if home_win_data else 0
            away_win = away_win_data if away_win_data else 0
            draw = draw_data if draw_data else 0
            
            if event_origin == EventOriginEnum.SCORE_DATA.value:
                entrada = Entrada.objects.get(id_event=id_event)
            
                if not entrada:
                    return Response({
                        'success': False,
                        'message': 'Entrada Score Date nao encontrada'
                    }, status=status.HTTP_404_NOT_FOUND)
                
                entrada.home_win = home_win
                entrada.away_win = away_win 
                entrada.draw_probability = draw
                entrada.save()
            
            elif event_origin == EventOriginEnum.OWNER_BALL.value:
                owner_ball_entry = SuperFavoriteHomeBallOwnerEntry.objects.get(id_event=id_event)
                
                if not owner_ball_entry:
                    return Response({
                        'success': False,
                        'message': 'Entrada owner ball nao encontrada'
                    }, status=status.HTTP_404_NOT_FOUND)
                    
                owner_ball_entry.home_win = home_win
                owner_ball_entry.away_win = away_win
                owner_ball_entry.draw_probability = draw
                owner_ball_entry.save()
            
            return Response({
                'success': True,
                'home_win': home_win,
                'draw': draw,
                'away_win': away_win    
            }, status=status.HTTP_200_OK)    
        else:
            raise NotFound()    
            
    except NotFound as e:
        return Response({
            'success': False,
            'message': e.detail
        }, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        return Response({
            'success': False,
            'message': e.detail
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    
    


@require_http_methods(['GET'])
def proximo_evento(request):
    now = timezone.now()
    duas_horas_atras = now -timedelta(hours=2)
    
    jogo_ao_vivo = Entrada.objects.filter(
        data_jogo__isnull=False,
        data_jogo__lt=now,
        data_jogo__gte=duas_horas_atras
    ).annotate(
        diferenca_tempo=Abs(F('data_jogo') - now)
    ).order_by('diferenca_tempo').first()
    
    
    proximo_jogo_futuro = Entrada.objects.filter(
        data_jogo__isnull=False,
        data_jogo__gte=now  
    ).annotate(
        diferenca_tempo=Abs(F('data_jogo') - now)
    ).order_by('diferenca_tempo').first()
    
    if not proximo_jogo_futuro:
        return JsonResponse({
            'success': False,
            'message': 'Nenhum evento futuro encontrado'
        }, safe=False)
    
    def serializar_entrada(entrada):
        if not entrada:
            return None
        
        tempo_diff = entrada.data_jogo if entrada.data_jogo < now else entrada.data_jogo - now
        
        return {
            'id_event': entrada.id_event,
            'mercado': entrada.mercado,
            'odd': float(entrada.odd),
            'odd_change': entrada.get_odd_change_display(),
            'home_actual': entrada.home_actual,
            'away_actual': entrada.away_actual,
            'data_jogo': entrada.data_jogo.isoformat() if entrada.data_jogo else None,
            'opcao_entrada': entrada.get_opcao_entrada_display(),
            'resultado_estatistica': entrada.resultado_estatistica,
            'tempo_diferenca': {
                'total_seconds': int(tempo_diff.total_seconds()),
                'horas': tempo_diff.seconds // 3600,
                'minutos': (tempo_diff.seconds % 3600) // 60,
                'formatado': str(tempo_diff).split('.')[0]  # Remove microssegundos
            }
        }
        
    response_data = {
        'success': True,
        'timestamp': now.isoformat(),
        'jogo_ao_vivo': serializar_entrada(jogo_ao_vivo),
        'proximo_jogo_futuro': serializar_entrada(proximo_jogo_futuro),
        'status': {
            'tem_jogo_ao_vivo': jogo_ao_vivo is not None,
            'tem_proximo_jogo': proximo_jogo_futuro is not None
        }
    }
    
    return JsonResponse(response_data, safe=False)
        
@dataclass
class Player:
    id: int
    name: str
    position: str
    avg_rating: float
    team_id: int
           
class LineupComparationView(APIView):
    
    def get(self, request, id_event):
        if not id_event:
            return Response({
                'success': False,
                'message': 'Paramentro incompleto. E necessario informar o eventID'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            lineups_data = ApiService.get_lineups(id_event)
            lineups_serializer = LineupsSerializer(data=lineups_data)
            
            if not lineups_serializer.is_valid():
                return Response({
                    'success': False,
                    'errors': lineups_serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
            home_players = self._convert_to_player_list(
                lineups_serializer.validated_data.get('data').get('home')
            )
            
            away_players = self._convert_to_player_list(
                lineups_serializer.validated_data.get('data').get('away')
            )
            
            analyser = LineupComparationService()
            
            compare_all = analyser.compare_all_home_vs_away(
                home_players,
                away_players
            )
            
            attack_vs_defense = analyser.compare_attack_vs_defense(
                home_players, 
                home_players[0].team_id,
                away_players,
                away_players[0].team_id
            )
            
            analyse_attack_vs_defense = analyser.analyse_attack_vs_defense_dual(
                home_players, 
                away_players,
            )
            
            compare_all_dict = asdict(compare_all)
            compare_all_dict = self._convert_decimals(compare_all_dict)
            
            attack_vs_defense_dict = asdict(attack_vs_defense)
            attack_vs_defense_dict = self._convert_decimals(attack_vs_defense_dict)
            
            analyse_attack_vs_defense_dict = asdict(analyse_attack_vs_defense)
            analyse_attack_vs_defense_dict = self._convert_decimals(analyse_attack_vs_defense_dict)
            
            return Response({
                'success': True,
                'data': {
                    'compareAll': compare_all_dict,
                    'attackVsDefense': attack_vs_defense_dict,
                    'analyseAttackVsDefense': analyse_attack_vs_defense_dict
                }
            }, status=status.HTTP_200_OK)
            
        except requests.exceptions.RequestException as e:
            return Response({
                'success': False,
                'message': f'Erro ao conectar com a API: {str(e)}'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
        except Exception as e:
            return Response({
                'success': False,
                'message':f'Erro inesperado: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
            
    @staticmethod
    def _convert_to_player_list(players_data: list) -> list:
        players_list = []
        
        for player_data in players_data:
            avg_rating = float(player_data.get('avg_rating', 0))
            
            player = Player(
                id=player_data.get('id'),
                name=player_data.get('name'),
                position=player_data.get('position'),
                avg_rating=avg_rating,
                team_id=player_data.get('team_id')
            )
            players_list.append(player)
        
        return players_list
    
    
    @staticmethod
    def _convert_decimals(obj):
        """Converte Decimal para float recursivamente"""
        if isinstance(obj, dict):
            return {k: LineupComparationView._convert_decimals(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [LineupComparationView._convert_decimals(item) for item in obj]
        elif isinstance(obj, Decimal):
            return float(obj)
        else:
            return obj
        
        
    # TODO Continuar https://claude.ai/chat/f04db11a-231a-4012-b41c-16e721e6edf7
