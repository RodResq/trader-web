from django.shortcuts import render, get_object_or_404, redirect
from analytics.models import VwConsultaMercadoSf
from django.http import JsonResponse

# Create your views here.
def index(request):
    mercados = VwConsultaMercadoSf.objects.all().order_by("-home_actual")
    return render(request, 'analytics/index.html', {'mercados': mercados, 'use_utc': True})


def apostar(request):
    event_id = request.GET.get('event_id')
    action = request.GET.get('action')
    
    if not event_id or not action:
        return JsonResponse({
            'success':False,
            'message': 'Parâmetros incompletos. É necessário fornecer event_id e action.'
        }, status=400)
    
    try:
        mercado = get_object_or_404(VwConsultaMercadoSf, id_event=event_id)
        
        if action == 'aceitar':
            
            print(f'Aposta aceita no mercado: {mercado}')
            
            return JsonResponse({
                'success': True,
                'message': 'Aposta registrada com sucesso!',
                'data': {
                    'id_event': mercado.id_event,
                    'mercado': mercado.mercado,
                    'odd': float(mercado.odd) if mercado.odd else None,
                }
            })
        else:
            return JsonResponse({
                'sucess': False,
                'message': f'Erro ao processar aposta {str(e)}',
            }, status=400)
            
    except Exception as e:
        pass
    
    
    pass
def evento(request, id_evento):
    return render(request, 'analytics/resultado.html', {'id_evento': id_evento})


def lucros(request):
    return render(request, 'analytics/lucro/lucros.html')


def eventos(request):
    return render(request, 'analytics/eventos/eventos.html')