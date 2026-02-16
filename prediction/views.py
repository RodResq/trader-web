from rest_framework import generics, permissions, status
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.db import transaction

from team_sports.models import TeamSports, TeamSofascoreVsTeamSports
from team.models import TeamSofascore

import os
import logging
import requests

logger = logging.getLogger(__name__)

class PredictionView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get(self, request):
        try:
            id_team_home = request.query_params.get('idHome')
            name_home = request.query_params.get('nameHome')
            id_team_away = request.query_params.get('idAWay')
            name_away = request.query_params.get('nameAway')
            country = request.query_params.get('country')
            event_date = request.query_params.get('date')
            
            if not id_team_home or not id_team_away or not event_date:
                logger.info('Dados dos times e eventos nao encontrados')
            
            url = os.getenv('URL_BASE_API_SPORTS') + '/teams'  
            response = requests.get(
                url,
                params ={
                    'name': name_home,
                    'country': country
                },
                headers={
                    'x-apisports-key': os.getenv('API_SPORTS_KEY')
                }
            )
            
            if not response:
                return JsonResponse({
                    'success': False,
                    'erro': 'Team nao encontrado na api sports'
                }, status=404)
                
            response_json = response.json()
            team_sf = get_object_or_404(TeamSofascore, pk=id_team_home)
            
            with transaction.atomic():  
                team_sports = self._create_team_sports(response_json);
                self._create_intermediary_table(team_sf,  team_sports)
            
            return JsonResponse({
                'sucess': True,
                'message': 'Team Sports Criado'
            })
        except requests.exceptions.RequestException as e:
            return JsonResponse({
                'success': False,
                'erro': str(e)
            }, status=500)
            
    def _create_team_sports(self, response):
        response_obj = response.get('response', [])
        response_team = response_obj[0].get('team', {})
        team_sports = TeamSports.objects.create(
            id= response_team.get('id'),
            name = response_team.get('name'),
            code = response_team.get('code'),
            country = response_team.get('country'),
            logo = response_team.get('logo') 
        )
        
        return team_sports
    
    def _create_intermediary_table(self, team_sf, team_sports):
        TeamSofascoreVsTeamSports.objects.create(
            sofascore_team = team_sf,
            sports_team = team_sports
        )
