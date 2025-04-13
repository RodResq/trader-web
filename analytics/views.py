from django.shortcuts import render
from analytics.models import VwConsultaMercadoSf

# Create your views here.
def index(request):
    mercados = VwConsultaMercadoSf.objects.all().order_by("-home_actual")
    return render(request, 'analytics/index.html', {'mercados': mercados, 'use_utc': True})


def evento(request, id_evento):
    return render(request, 'analytics/resultado.html', {'id_evento': id_evento})


def lucros(request):
    return render(request, 'analytics/lucro/lucros.html')


def eventos(request):
    return render(request, 'analytics/eventos/eventos.html')