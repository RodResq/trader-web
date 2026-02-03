from rest_framework import generics, permissions, status
from django.http import JsonResponse

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
            name_away = request.query_params.get('nameAWay')
            country = request.query_params.get('country')
            event_date = request.query_params.get('date')
            
            if not id_team_home or not id_team_away or not event_date:
                logger.info('Dados dos times e eventos nao encontrados')
            
            url = os.getenv('URL_BASE_API_SPORTS') + '/teams'  
            requests.get(
                url,
                params ={
                    'name': name_home,
                    'country': country
                },
                headers={
                    'x-apisports-key': os.getenv('API_SPORTS_KEY')
                },
                timout=5
            )
        except requests.exceptions.RequestException as e:
            return JsonResponse({
                'success': False,
                'erro': str(e)
            }, status=500)
            
            