from django.shortcuts import render
from analytics.models import VwAnalyticsMercadoV2

# Create your views here.
def index(request):
    analytics = VwAnalyticsMercadoV2.objects.all()
    return render(request, 'analytics/index.html', {'analytics': analytics})