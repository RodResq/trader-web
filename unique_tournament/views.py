import logging

import requests
from django.forms.models import model_to_dict
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .models import UniqueTournament

logger = logging.getLogger(__name__)

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
            
            
class UniqueTournaments(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get(self, request, id_unique):
        try:
            response = requests.get(f'http://127.0.0.1:8081/api/v1/unique-tournaments/{id_unique}')
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
