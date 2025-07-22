from django.http import request
from django.shortcuts import render
from .models import TeamSofascore
from .helpers import recuperar_icone_team


def teams(request):
    # TODO Retornar todos os times cadastrados no formato {total: x, teams_sofascore: dados, teams_owner_ball: dados}
    
    teams = Team.objects.all();
    
    for team in teams:
        if team.id_team == 1:
            icon = recuperar_icone_team(team.id_team)
            team.icon = icon
        return render(request, 'analytics/team/index.html', {
            'teams': teams
        })
