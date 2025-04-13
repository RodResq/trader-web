from django.shortcuts import render, get_object_or_404, redirect
from analytics.models import VwConsultaMercadoSf

# Create your views here.
def index(request):
    mercados = VwConsultaMercadoSf.objects.all().order_by("-home_actual")
    return render(request, 'analytics/index.html', {'mercados': mercados, 'use_utc': True})


def apostar(request, id_event):
    mercado = get_object_or_404(VwConsultaMercadoSf, pk=id_event)
    print(f"Aposta registrada para o mercado: {mercado}")
    return redirect('index')

def evento(request, id_evento):
    return render(request, 'analytics/resultado.html', {'id_evento': id_evento})


def lucros(request):
    return render(request, 'analytics/lucro/lucros.html')


def eventos(request):
    return render(request, 'analytics/eventos/eventos.html')