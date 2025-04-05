from django.shortcuts import render
from analytics.models import VwConsultaMercadoSf

# Create your views here.
def index(request):
    mercados = VwConsultaMercadoSf.objects.all().order_by("-home_actual")
    for mercado in mercados:
        print(mercado.mercado)
    return render(request, 'analytics/index.html', {'mercados': mercados})