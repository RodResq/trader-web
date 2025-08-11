from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.forms.models import model_to_dict
from .models import UniqueTournament
import requests

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
                response = requests.get(f'http://127.0.0.1:8080/unique_tournament/icon/{id_unique_tournament}')
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