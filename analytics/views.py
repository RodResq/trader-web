import json
from django.utils import timezone
from django.db import transaction
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404, redirect
from analytics.models import VwConsultaMercadoSf, Entrada
from analytics.helpers import dump_mercados_para_entrada
from django.http import JsonResponse
from periodo.models import Periodo 

# Create your views here.
def index(request):
        dump_mercados_para_entrada()
        entradas = Entrada.objects.all()
        qtd_periodos = Periodo.objects.count() 
        qtd_eventos = Entrada.objects.count()
            
        return render(request, 'analytics/index.html', {
            'mercados': entradas,
            'qtd_eventos': qtd_eventos,
            'qtd_periodos': qtd_periodos
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
            print(f"Event ID: {mercado.id_event}, Away Actual: {mercado.away_actual}")
            data.append({
                'id_event': mercado.id_event,
                'mercado': mercado.mercado,
                'odd': float(mercado.odd) if mercado.odd else None,
                'home_actual': mercado.home_actual,
                'away_actual': mercado.away_actual,
                'data_jogo': mercado.data_jogo.strftime('%d/%m/%Y %H:%M:%S') if mercado.data_jogo else None,
                'opcao_entrada': mercado.opcao_entrada
            })
        return JsonResponse({
            'success': True,
            'mercados': data
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
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
            

def entrada_multipla(request):
    if request.method == 'POST':
        try:
             # Obter dados da requisição
            data = json.loads(request.body)
            event_ids = data.get('event_ids', [])
            action = data.get('action')
             
             # Validar parâmetros
            if not event_ids or action not in ['aceitar', 'recusar']:
                return JsonResponse({'sucess': False,'message': 'Parâmetros inválidos.'}, status=400)
            
             # Recuperar todas as entradas
            entradas = Entrada.objects.filter(id_event__in=event_ids)
            
             # Verificar se todos os eventos foram encontrados
            if len(entradas) != len(event_ids):   
                return JsonResponse({
                    'success': False,
                    'message': 'Alguns eventos não foram encontrados.'
                }, status=400)
            
             # Gerar um código único para a múltipla
            cod_multipla = f"ML-{timezone.now().strftime('%Y%m%d%H%M%S')}"
            
            odd_multipla = 1.0
             
            for entrada in entradas:
                 # Verificar se alguma entrada já está em uma múltipla
                if entrada.is_multipla:
                    return JsonResponse({
                        'sucess': False,
                        'message':  f'O evento {entrada.id_event} já faz parte de uma múltipla.'
                    }, status=400)
                     
            odd_multipla *= entrada.odd
             
             # Verificar período válido
            periodos_validos = Periodo.objects.filter(
                data_inicial__lte=min(entrada.data_jogo for entrada in entradas),
                data_final__gte=max(entrada.data_jogo for entrada in entradas)
            )
             
            if not periodos_validos.exists():
                return JsonResponse({
                    'success': False,
                    'message': 'Não existe um período válido para esta múltipla.'
                }, status=400)
            
             # Selecionar o primeiro período válido
            periodo = periodos_validos.first()
            
             # Processar cada entrada
            with transaction.atomic():
                for entrada in entradas:
                    if action == 'aceitar':
                        entrada.opcao_entrada = "A"
                    elif action == 'recusar':
                        entrada.opcao_entrada == "R"
                    entrada.is_multipla = True
                    entrada.cod_multipla = cod_multipla
                    entrada.id_periodo = periodo
                    entrada.save()
                     
            return JsonResponse({
                 'success': True,
                 'message': f'Múltipla criada com sucesso!',
                 'data': {
                    'cod_multipla': cod_multipla,
                    'odd_multipla': odd_multipla,
                    'quantidade_eventos': len(event_ids),
                    'periodo': periodo.id
                 }
             })

        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'message': 'Corpo da requisição inválido.'
            }, status=400)
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Erro ao processar múltipla: {str(e)}'
            }, status=500)
            
    return JsonResponse({
        'success': False,
        'message': 'Método não permitido.'
    }, status=405)
            