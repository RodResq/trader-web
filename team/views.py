from django.http import request
from django.shortcuts import render
from .models import TeamSofascore


def teams(request):
    teams = TeamSofascore.objects.all();
    
    return render(request, 'analytics/team/index.html', {
        'teams': teams
    })
