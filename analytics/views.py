import json
from django.utils import timezone
from django.db import transaction
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404, redirect
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required
from analytics.models import VwConsultaMercadoSf, Entrada, Aposta, VwMercadoOwnerBallSfHome
from analytics.helpers import dump_mercados_para_entrada
from ciclo.models import Ciclo 
from .forms import AceitarApostaForm
from eventos.models import Evento
from decimal import Decimal
from datetime import datetime
from django.core.exceptions import ValidationError
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.db.models import Sum
from gerencia.models import GerenciaCiclo
import json

# Create your views here.
def index(request):
        dump_mercados_para_entrada()
        
        # Get pagination parameters from request
        page = request.GET.get('page', 1)
        items_per_page = request.GET.get('items_per_page', 10)
        
        try:
            items_per_page = int(items_per_page)
            
            if (items_per_page > 50):
                items_per_page = 50    
        except ValueError:
            items_per_page = 10
        
        entradas = Entrada.objects.all()
        
        soma_retorno = GerenciaCiclo.objects.aggregate(total=Sum('valor_total_retorno'))
        
        # Create the paginator
        paginator = Paginator(entradas, items_per_page)
        
        try:
            paginated_entradas = paginator.page(page)
        except PageNotAnInteger:
            paginated_entradas = paginator.page(1)
        except EmptyPage:
            paginated_entradas = paginator.page(paginator.num_pages)
        
        qtd_ciclos = Ciclo.objects.count() 
        qtd_eventos = Entrada.objects.count()
            
        return render(request, 'analytics/index.html', {
            'mercados': paginated_entradas,
            'qtd_eventos': qtd_eventos,
            'qtd_ciclos': qtd_ciclos,
            'soma_total_retorno': soma_retorno['total'],
            'items_per_page': items_per_page
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
        existe_ciclo = Ciclo.objects.filter(data_inicial__lte=entrada.data_jogo, data_final__gte=entrada.data_jogo).exists()
        
        if not existe_ciclo:
            return JsonResponse({
                'success': False,
                'message': f'Não existe ciclo para a entrada.'
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


def gerencia(request):
    return render(request, 'analytics/gerencia/gerencia.html')


def eventos(request):
    return render(request, 'analytics/eventos/eventos.html')


def mercados(request):
    try:
        # Get pagination parameters
        page = request.GET.get('page', 1)
        items_per_page = request.GET.get('items_per_page', 10)
        
        try:
            items_per_page = int(items_per_page)
            if items_per_page > 50:
                items_per_page = 50
        except ValueError:
            items_per_page = 10
        
        mercados = Entrada.objects.all()

        # Create paginator
        paginator = Paginator(mercados, items_per_page)
        
        try:
            paginator_mercados = paginator.page(page)
        except PageNotAnInteger:
            paginator_mercados = paginator.page(1)
        except EmptyPage:
            paginator_mercados = paginator.page(paginator.num_pages)
        
        data = []
        for mercado in paginator_mercados:
            data.append({
                'id_event': mercado.id_event,
                'mercado': mercado.mercado,
                'odd': float(mercado.odd) if mercado.odd else 0,
                'home_actual': mercado.home_actual,
                'away_actual': mercado.away_actual,
                'data_jogo': mercado.data_jogo.strftime('%d/%m/%Y %H:%M:%S') if mercado.data_jogo else None,
                'opcao_entrada': mercado.opcao_entrada
            })
        return JsonResponse({
            'success': True,
            'mercados': data,
            'pagination': {
                'current_page': paginator_mercados.number,
                'total_pages': paginator.num_pages,
                'items_per_page': items_per_page,
                'total_items': paginator.count
            }
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
            
            
    
@require_POST
# @login_required        
def aceitar_aposta(request):
    """
    View para processar a aceitação de uma aposta.
    Recebe os dados do formulário via AJAX e retorna resposta JSON.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            form = AceitarApostaForm(data=data)
            
            if form:
                id_evento = form.data['evento_id']
                valor_entrada = form.data['valor_entrada']
                valor_retorno = form.data['valor_retorno']
                
                entrada = get_object_or_404(Entrada, id_event=id_evento)
                ciclo = Ciclo.objects.filter(
                    data_inicial__lte=entrada.data_jogo,
                    data_final__gte=entrada.data_jogo
                ).first()
                
                if not ciclo:
                    return JsonResponse({
                        'sucess': False,
                        'message': 'Não existe um ciclo ativo para a data deste evento'
                    }, status=400)
                    
                if valor_entrada > ciclo.valor_disponivel_entrada:
                    return JsonResponse({
                        'success': False,
                        'message': f'Valor excede o disponível (R$ {ciclo.valor_disponivel_entrada})'
                    }, status=400)
                    
                aposta = Aposta.objects.filter(entrada__id_event=id_evento).first()
                
                if aposta:
                    aposta.valor = valor_entrada
                    aposta.retorno = valor_retorno
                    aposta.save()
                else:
                    aposta = Aposta.objects.create(
                        entrada=entrada,
                        ciclo=ciclo,
                        is_multipla=False,
                        valor=valor_entrada,
                        retorno=valor_retorno
                    )
                
                entrada.opcao_entrada = 'A'
                entrada.save()
                
                ciclo.valor_disponivel_entrada -= Decimal(valor_entrada)
                ciclo.save()
                
                return JsonResponse({
                    'success': True,
                    'message': 'Aposta aceita com sucesso',
                    'aposta_id': aposta.id
                })
            else:
                return JsonResponse({
                    'success': False,
                    'message': 'Formulário inválido',
                    'erros': form.errors
                })
                
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Erro ao processar a aposta: {str(e)}'
            }, status=500)
            
    return JsonResponse({
        'success': False,
        'message': 'Método não permitido'
    }, status=405)
    
    
@require_POST
def entrada_multipla(request):
    """
    View para processamento de entradas múltiplas (aceitar ou recusar)
    """
    if request.method == 'POST':
        try:
            # Obter dados da requisição
            data = json.loads(request.body)
            event_ids = data.get('event_ids', [])
            action = data.get('action')
            valor_entrada = Decimal(str(data.get('valor_entrada', 0)))
            odd_combinada = Decimal(str(data.get('odd_combinada', 1.0)))
            retorno_esperado = Decimal(str(data.get('retorno_esperado', 0)))
            
            # Validar parâmetros
            if not event_ids or action not in ['aceitar', 'recusar']:
                return JsonResponse({
                    'success': False,
                    'message': 'Parâmetros inválidos.'
                }, status=400)
            
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
            
            for entrada in entradas:
                # Verificar se alguma entrada já está em uma múltipla
                aposta = Aposta.objects.filter(entrada__id_event=entrada.id_event).first()
                
                if aposta and aposta.is_multipla:
                    return JsonResponse({
                        'success': False,
                        'message': f'O evento {entrada.id_event} já faz parte de uma múltipla.'
                    }, status=400)
            
            # Verificar ciclo válido
            ciclos_validos = Ciclo.objects.filter(
                data_inicial__lte=min(entrada.data_jogo for entrada in entradas),
                data_final__gte=max(entrada.data_jogo for entrada in entradas)
            )
            
            if not ciclos_validos.exists():
                return JsonResponse({
                    'success': False,
                    'message': 'Não existe um ciclo válido para esta múltipla.'
                }, status=400)
            
            # Selecionar o primeiro ciclo válido
            ciclo = ciclos_validos.first()
            
            # Para aceitar, verificar valor disponível
            if action == 'aceitar':
                if valor_entrada <= 0:
                    return JsonResponse({
                        'success': False,
                        'message': 'Valor de entrada inválido.'
                    }, status=400)
                
                if valor_entrada > ciclo.valor_disponivel_entrada:
                    return JsonResponse({
                        'success': False,
                        'message': f'Valor excede o disponível (R$ {ciclo.valor_disponivel_entrada})'
                    }, status=400)
            
            # Processar cada entrada
            with transaction.atomic():
                for entrada in entradas:
                    if action == 'aceitar':
                        entrada.opcao_entrada = "A"
                        # Criar registro de aposta
                        aposta = Aposta.objects.create(
                            entrada=entrada,  
                            ciclo=ciclo,
                            valor=valor_entrada,
                            retorno=retorno_esperado,
                            is_multipla = True,
                            cod_multipla = cod_multipla
                        )
                    elif action == 'recusar':
                        entrada.opcao_entrada = "R"
                        
                    entrada.save()
                    aposta.save()
                    
                # Atualizar saldo disponível do ciclo
                ciclo.valor_disponivel_entrada -= valor_entrada
                ciclo.save()
            
            return JsonResponse({
                'success': True,
                'message': f'Múltipla {"aceita" if action == "aceitar" else "recusada"} com sucesso!',
                'data': {
                    'cod_multipla': cod_multipla,
                    'odd_combinada': float(odd_combinada),
                    'quantidade_eventos': len(event_ids),
                    'ciclo': ciclo.id
                }
            })
        
        except ValueError as e:
            return JsonResponse({
                'success': False,
                'message': f'Valor inválido: {str(e)}'
            }, status=400)
        
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


@require_POST
def verificar_ciclo(request):
    """
    View para verificar se um conjunto de datas pertence a um ciclo válido
    """
    try:
        data = json.loads(request.body)
        datas = data.get('datas', [])
        
        if not datas:
            return JsonResponse({
                'success': False,
                'message': 'Nenhuma data fornecida.'
            }, status=400)
        
        # Converter datas para datetime se necessário
        datas_formatadas = []
        
        for data_str in datas:
            try:
                # Tenta converter no formato padrão brasileiro
                data = datetime.strptime(data_str, '%d/%m/%Y %H:%M:%S')
            except ValueError:
                try:
                    # Tenta formato ISO
                    data = datetime.fromisoformat(data_str.replace('Z', '+00:00'))
                except ValueError:
                    return JsonResponse({
                        'success': False,
                        'message': f'Formato de data inválido: {data_str}'
                    }, status=400)
            
            datas_formatadas.append(data)
        
        # Encontrar ciclo que engloba todas as datas
        ciclo = Ciclo.objects.filter(
            data_inicial__lte=min(datas_formatadas),
            data_final__gte=max(datas_formatadas)
        ).first()
        
        if not ciclo:
            return JsonResponse({
                'success': False,
                'message': 'Não existe um ciclo válido para todas as datas selecionadas.'
            })
        
        # Retorna informações do ciclo
        return JsonResponse({
            'success': True,
            'ciclo': {
                'id': ciclo.id,
                'categoria': ciclo.get_categoria_display(),
                'data_inicial': ciclo.data_inicial.strftime('%d/%m/%Y'),
                'data_final': ciclo.data_final.strftime('%d/%m/%Y'),
                'saldo_atual': float(ciclo.saldo_atual),
                'valor_disponivel_entrada': float(ciclo.valor_disponivel_entrada)
            }
        })
    
    except ValidationError as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=400)
    
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Erro ao verificar ciclo: {str(e)}'
        }, status=500)