from django.shortcuts import render

from rest_framework import generics
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework import status

import requests
import logging

logger = logging.getLogger(__name__)

def tournaments_render(request):
    return render(request, 'analytics/tournament/index.html')

# Create your views here.
class UniqueTournaments(generics.ListCreateAPIView):
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
