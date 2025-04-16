from django.shortcuts import render, get_object_or_404, redirect
from analytics.models import VwConsultaMercadoSf, LittleFaith
from django.http import JsonResponse

# Create your views here.
def index(request):
    mercados = VwConsultaMercadoSf.objects.all().order_by("-home_actual")
    
    apostas_aceitas = LittleFaith.objects.values_list('id_event', flat=True)
    
    return render(request, 'analytics/index.html', {
        'mercados': mercados,
        'apostas_aceitas': list(apostas_aceitas), 
        'use_utc': True
    })


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
            
            LittleFaith.objects.create(
                id_event=mercado.id_event, 
                mercado=mercado.mercado, 
                odd=mercado.odd, 
                home_actual=mercado.home_actual, 
                away_actual=mercado.away_actual, 
                data_jogo=mercado.data_jogo,
                aposta_aceita=True
            )
            
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
                'message': f'Ação "{action}" não reconhecida.'
            }, status=400)
            
    except Exception as e:
        return JsonResponse({
            'sucess': False,
            'message': f'Erro ao processar aposta: {str(e)}',
        }, status=400)
    
    
def evento(request, id_evento):
    return render(request, 'analytics/resultado.html', {'id_evento': id_evento})


def lucros(request):
    return render(request, 'analytics/lucro/lucros.html')


def eventos(request):
    return render(request, 'analytics/eventos/eventos.html')


def mercados(request):
    try:
        # mercados = VwConsultaMercadoSf.objects.all().order_by("-home_actual");
        # apostas_aceitas = list(LittleFaith.objects.values_list('id_event', flat=True));
        mercados = LittleFaith.objects.all().order_by("-home_actual")
        
        data = []
        for mercado in mercados:
            data.append({
                'id_event': mercado.id_event,
                'mercado': mercado.mercado,
                'odd': float(mercado.odd) if mercado.odd else None,
                'home_actual': mercado.home_actual,
                'away_actual': mercado.away_actual if mercado.away_actual else 0,
                'data_jogo': mercado.data_jogo.strftime('%d/%m/%Y %H:%M:%S') if mercado.data_jogo else None,
                'aposta_aceita': mercado.aposta_aceita
            })
        
        return JsonResponse({
            'success': True,
            'mercados': data
        })
    except Exception as e:
        return JsonResponse({
            'success': True,
            'mercados': f'Erro ao obter mercados: {str(e)}'
        }, status=500)