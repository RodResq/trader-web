import logging

import requests
from django.forms.models import model_to_dict
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .models import UniqueTournament
from datetime import datetime

from dotenv import load_dotenv
import os

load_dotenv()

logger = logging.getLogger(__name__)

def unique_tournaments_render(request):
    return render(request, 'analytics/unique_tournament/index.html')

# Create your views here.
def get_icon_unique_tournament(request):
    if request.method == 'GET':
        id_unique_tournament = request.GET.get('id_unique_tournament')
        try:
            unique_tournament = get_object_or_404(UniqueTournament, id=id_unique_tournament)
            
            if not unique_tournament:
                return JsonResponse({
                    'success': False,
                    'message': 'Unique Tournament nao cadastrado'
                }, status=404)
            
            if not unique_tournament.icon:
                response = requests.get(f'http://127.0.0.1:8080/unique-tournament/icon/{id_unique_tournament}')
                data = response.json()
                
                if data['success']:
                    unique_tournament.icon = data['data']
                    unique_tournament.save()
            
            return JsonResponse({
                'success': True,
                'uniqueTournament': model_to_dict(unique_tournament)
            }, status=200)
            
        except requests.exceptions.RequestException as e:
            return JsonResponse({
                'success': False,
                'erro': str(e)
            }, status=500)
            
class UniqueTournamentsList(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get(self, request):
        try:
            page_number = request.query_params.get('page', 1)
            page_size = request.query_params.get('size', 10)
            response = requests.get(f'http://127.0.0.1:8081/api/v1/unique-tournaments?page={page_number}&size={page_size}')
            response.raise_for_status()
            response_data = response.json()
            
            if not response_data:
                return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
            
            return Response(response_data, status=status.HTTP_200_OK)
        except requests.RequestException as e:
            return Response({
                'success': False,
                'message': f'Erro ao buscar dados {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
  
def extract_unique_tournament_data(response_data):
    ut = response_data.get('uniqueTournament', {})
    
    to_datetime = lambda ts: datetime.fromtimestamp(ts) if ts else None
    
    return {
        'country_name': str(ut.get('category', {}).get('name', {})).upper(),
        'has_groups': ut.get('hasGroups', {}),
        'has_rounds': ut.get('hasRounds', {}),
        'ids_teams_most_titles': ','.join(str(team.get('id')) for team in ut.get('mostTitlesTeams', [])), # Corrigir para armazenar apenaus 1 id
        'id_team_title_holder': ut.get('titleHolder', {}).get('id'),
        'start_date_timestamp': to_datetime(ut.get('startDateTimestamp', {})),
        'end_date_timestamp': to_datetime(ut.get('endDateTimestamp', {})),
    }
    
class UniqueTournaments(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get(self, request, id_unique):
        try:
            unique_tournament = get_object_or_404(UniqueTournament, id=id_unique)
            if unique_tournament:
                response = requests.get(f'http://127.0.0.1:8081/api/v1/unique-tournaments/{id_unique}')
                response.raise_for_status()
                response_data = response.json()
                
                if not response_data:
                    return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
                
                unique_tournament.__dict__.update(extract_unique_tournament_data(response_data))
                unique_tournament.save(force_update=True)
                
                external_response = requests.get(
                    'https://v3.football.api-sports.io/leagues',
                    params={
                        'season': unique_tournament.start_date_timestamp.year,
                        'country': response_data.get('uniqueTournament', {}).get('category', {}).get('name', {})
                    },
                    headers={
                        'x-apisports-key': os.getenv('API_SPORTS_KEY')
                    },
                    timeout=5
                )
                external_response.raise_for_status()
                league_data = external_response.json()
                
                logger.info(f'League Date: {league_data}')
                
                return Response(response_data, status=status.HTTP_200_OK)
        except requests.RequestException as e:
            return Response({
                'success': False,
                'message': f'Erro ao buscar dados {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)            
