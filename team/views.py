from django.http import request
from django.shortcuts import render

def teams(request):
    # TODO Retornar todos os times cadastrados no formato {total: x, teams_sofascore: dados, teams_owner_ball: dados}
    return render(request, 'analytics/team/index.html')
