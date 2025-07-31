from django.http import request
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from .models import TeamSofascore
from analytics.models import Entrada
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
            
            
def get_event(request):
    if request.method == 'GET':
        id_event = request.GET.get('id_event')
        checked = request.GET.get('checked')
        
        if not id_event:
            return JsonResponse({
                'success': False,
                'message': 'Parâmetros incompletos. É necessário fornecer o id_event'
            }, status=400)
        
        try:
            entrada = get_object_or_404(Entrada, id_event=int(id_event))
            if 'true' in checked:
                entrada.next_event_priority = True
            else:
                entrada.next_event_priority = False
            entrada.save()
            
            return JsonResponse({
                'success': True,
                'id_event': id_event,
                'next_event_priority': entrada.next_event_priority
            })
            
        except requests.exceptions.RequestException as e:
            return JsonResponse({
                'success': False,
                'erro': str(e)
            }, status=500)
        