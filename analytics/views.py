from django.shortcuts import render
from models import MercadoSuperFavorito

# Create your views here.
def index(request):
    mercados = MercadoSuperFavorito.objects.all()
    return render(request, 'analytics/index.html', {"mercados": mercados})