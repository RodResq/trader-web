from django.http import request
from django.shortcuts import render
from django.http import JsonResponse
from .models import TeamSofascore
import requests


def teams(request):
    teams = TeamSofascore.objects.all();
    
    return render(request, 'analytics/team/index.html', {
        'teams': teams
    })


def events(request):
    if request.method == 'GET':
        id_team = request.GET.get('id_team')
        
        if not id_team:
            return JsonResponse({
                'success': False,
                'message': 'Parâmetros incompletos. É necessário fornecer o id_team'
            }, status=400)
            
        try:
            response = requests.get(f'http://127.0.0.1:8080/eventos-team/{id_team}')
            response.raise_for_status()
            
            dados = response.json()
            
            return JsonResponse({
                'success': True,
                'dados': dados 
            })
        except requests.exceptions.RequestException as e:
            return JsonResponse({
                'success': False,
                'erro': str(e)
            }, status=500)
            
        