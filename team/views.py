from django.http import request
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.forms.models import model_to_dict
from team.models import TeamSofascore
from analytics.models import Entrada
from rest_framework import generics
from rest_framework import permissions
from rest_framework.renderers import JSONRenderer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from team.serializers import TeamSofascoreSerializer
import requests
import io



class TeamList(generics.ListCreateAPIView):
    queryset =  TeamSofascore.objects.filter(ativo=1)\
        .exclude(name__iregex=r'U\d{2}$').all()
    serializer_class = TeamSofascoreSerializer


class TeamEvents(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get(self, request, id_team):
        if not id_team:
            return Response({
                'success': False,
                'message': 'Parâmetros incompletos. É necessário fornecer o id_team'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            response = requests.get(f'http://127.0.0.1:8080/team/{id_team}/events')
            response.raise_for_status()
            dados = response.json()
            
            return Response(dados, status=status.HTTP_200_OK)
        
        except requests.RequestException as e:
            return Response({
                'success': False,
                'message': f'Erro ao buscar dados: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            

def teams(request):
    teams = TeamSofascore.objects.filter(ativo=1)\
        .exclude(name__iregex=r'U\d{2}$').all()
    
    return render(request, 'analytics/team/index.html', {
        'teams': teams
    })

# deprecated
def events(request):
    if request.method == 'GET':
        id_team = request.GET.get('id_team')
        
        if not id_team:
            return JsonResponse({
                'success': False,
                'message': 'Parâmetros incompletos. É necessário fornecer o id_team'
            }, status=400)
            
        try:
            response = requests.get(f'http://127.0.0.1:8080/team/{id_team}/events')
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
            
            
def get_event(request, id_team):
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
            
            
def get_team(request, id_team):
    if request.method == 'GET':
        
        try:
            team = get_object_or_404(TeamSofascore, id_team=id_team)
            if not team.icon:
                response = requests.get(f'http://127.0.0.1:8080/team_icon/{id_team}')
                data = response.json()
                if data['success'] == True:
                    icon_team = data['data']
                    team.icon = icon_team
                    team.save()
                    
            return JsonResponse({
                'success': True,
                'team': model_to_dict(team)    
            })
        except requests.exceptions.RequestException as e:
            return JsonResponse({
                'success': False,
                'erro': str(e)
            }, status=500)
            
            
def find_team(request):
    if request.method == 'GET':
        name = request.GET.get('name')
        try:
            team = get_object_or_404(TeamSofascore, name=name)
            return JsonResponse({
                'success': True,
                'team': model_to_dict(team)
            })
        except requests.exceptions.RequestException as e:
            return JsonResponse({
                'success': False,
                'erro': str(e)
            }, status=500)
        
    