from django.shortcuts import render, get_object_or_404, redirect
from analytics.models import VwConsultaMercadoSf, Entrada
from analytics.helpers import dump_mercados_para_entrada
from django.http import JsonResponse
from periodo.models import Periodo 

# Create your views here.
def index(request):
        dump_mercados_para_entrada()
        entradas = Entrada.objects.all().order_by("-data_jogo")
        qtd_periodos = Periodo.objects.count() 
           
        return render(request, 'analytics/index.html', {
            'mercados': entradas,
            'qtd_periodos': qtd_periodos, 
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
        entrada = get_object_or_404(Entrada, id_event=event_id)
        existe_periodo = Periodo.objects.filter(data_inicial__lte=entrada.data_jogo, data_final__gte=entrada.data_jogo).exists()
        
        if not existe_periodo:
            return JsonResponse({
                'sucess': False,
                'message': f'Não existe período para a entrada.'
            }, status=400)
            
        if action == 'aceitar':        
            print(f'Aposta aceita no mercado: {entrada}')
            
            entrada.opcao_entrada = "A"
            entrada.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Aposta registrada com sucesso!',
                'data': {
                    'id_event': entrada.id_event,
                    'mercado': entrada.mercado,
                    'odd': float(entrada.odd) if entrada.odd else None,
                }
            })
        elif action == 'recusar':
            entrada.opcao_entrada = "R"
            entrada.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Aposta recusada!',
                'data': {
                    'id_event': entrada.id_event,
                    'mercado': entrada.mercado,
                    'odd': float(entrada.odd) if entrada.odd else None,
                }
            })
        elif action == 'desfazer':
            entrada.opcao_entrada = "E"
            entrada.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Entrada desfeita!',
                'data': {
                    'id_event': entrada.id_event,
                    'mercado': entrada.mercado,
                    'odd': float(entrada.odd) if entrada.odd else None,
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
        mercados = Entrada.objects.all().order_by("-home_actual")
        data = []
        for mercado in mercados:
            data.append({
                'id_event': mercado.id_event,
                'mercado': mercado.mercado,
                'odd': float(mercado.odd) if mercado.odd else None,
                'home_actual': mercado.home_actual,
                'away_actual': mercado.away_actual if mercado.away_actual else 0,
                'data_jogo': mercado.data_jogo.strftime('%d/%m/%Y %H:%M:%S') if mercado.data_jogo else None,
                'opcao_entrada': mercado.opcao_entrada
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
        
        
def editar_odd(request):
    if request.method == 'GET':
        event_id = request.GET.get('event_id')
        nova_odd = request.GET.get('odd')
        
        if not event_id or not nova_odd:
            return JsonResponse({
                'success': False,
                'message': 'Parâmetros incompletos. É necessário fornecer event_id e odd.'
            }, status=400)
            
        try:
            
            nova_odd = float(nova_odd)
            if nova_odd < 1.01:
                return JsonResponse({
                    'success': False,
                    'message': 'Odd inválida. Valor mínimo é 1.01.'
                }, status=400)
                
            entrada = get_object_or_404(Entrada, id_event=event_id)
            entrada.odd = nova_odd
            entrada.save()
            
            return JsonResponse({
                'success': False,
                'message': 'Odd atualizada com sucesso!',
                'data': {
                    'id_event': entrada.id_event,
                    'odd': float(entrada.odd),
                    'mercado': entrada.mercado
                }
            })
        except ValueError:
            return JsonResponse({
                'success': False,
                'message': 'Odd inválida. Use um número decimal.'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'sucess':False,
                'message': f'Erro ao atualizar odd: {str(e)}'
            }, status=500)
            