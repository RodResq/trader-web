import json
from django.utils import timezone
from django.db import transaction
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404, redirect
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required
from analytics.models import VwConsultaMercadoSf, Entrada, Aposta, VwMercadoOwnerBallSfHome, OddChange, VwMercadoOwnerBallFavoritoHome, VwMercadoOwnerBallUnder2_5
from analytics.helpers import dump_mercados_para_entrada
from ciclo.models import Ciclo 
from .forms import AceitarApostaForm
from evento.models import Evento
from decimal import Decimal
from datetime import datetime
from django.core.exceptions import ValidationError
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.db.models import Sum, Q
from gerencia.models import GerenciaCiclo
import json
import asyncio
import aiohttp
import requests
import logging

logger = logging.getLogger(__name__)

def index(request):
        dump_mercados_para_entrada()
        
        page = request.GET.get('page', 1)
        items_per_page = request.GET.get('items_per_page', 10)
        
        try:
            items_per_page = int(items_per_page)
            
            if (items_per_page > 50):
                items_per_page = 50    
        except ValueError:
            items_per_page = 10
        
        entradas = Entrada.objects.all()
        
        _verificar_mudanca_odd(entradas)
        
        soma_retorno = GerenciaCiclo.objects.aggregate(total=Sum('valor_total_retorno'))
        retorno_atual = GerenciaCiclo.objects.exclude(valor_total_retorno=0).order_by('-id').first()
        
        paginator = Paginator(entradas, items_per_page)
        
        try:
            paginated_entradas = paginator.page(page)
        except PageNotAnInteger:
            paginated_entradas = paginator.page(1)
        except EmptyPage:
            paginated_entradas = paginator.page(paginator.num_pages)
        
        qtd_ciclos = Ciclo.objects.count() 
        ciclo_atual = Ciclo.objects.order_by('-id').first()
        qtd_eventos = Entrada.objects.count()
            
        return render(request, 'analytics/index.html', {
            'mercados': paginated_entradas,
            'qtd_eventos': qtd_eventos,
            'qtd_ciclos': qtd_ciclos,
            'ciclo_atual': ciclo_atual.id,
            'ciclo_atual_disponivel': ciclo_atual.valor_disponivel_entrada,
            'soma_total_retorno': soma_retorno['total'],
            'retorno_atual': retorno_atual.valor_total_retorno,
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


async def buscar_odd_change(id_events):
    async with aiohttp.ClientSession as session:
        tasks = []
        for id_event in id_events:
            task = asyncio.create_task(
                session.get(f"http://127.0.0.1:8080/odd-change/{id_event}")
            )
            tasks.append(task)
        await asyncio.gather(*tasks, return_exceptions=True)


def mercados(request):
    try:
        page = request.GET.get('page', 1)
        items_per_page = request.GET.get('items_per_page', 10)
        
        try:
            items_per_page = int(items_per_page)
            if items_per_page > 50:
                items_per_page = 50
        except ValueError:
            items_per_page = 10
            
        try:
            eventos_ids = Entrada.objects.values_list('id_event', flat=True).distinct()
            api_base_url = "http://127.0.0.1:8080"
            
            for evento_id in eventos_ids:
                if evento_id == 13292666:
                    try:
                        response = requests.get(
                            f'{api_base_url}/odd-change/{evento_id}',
                            timeout=5
                        )
                        if response.status_code == 200:
                            pass # TODO Verificar Lógica ao 
                    except requests.exceptions.RequestException as e:
                        logger.error(f"Erro de conexão ao buscar odd-change para evento {evento_id}: {str(e)}")
                        continue
    
        except Exception as e:
            logger.error(f"Erro geral ao chamar API de odd-change: {str(e)}")         
                    
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
                'odd_change': mercado.odd_change,
                'odd': float(mercado.odd) if mercado.odd else 0,
                'home_actual': mercado.home_actual,
                'away_actual': mercado.away_actual,
                'data_jogo': mercado.data_jogo.strftime('%d/%m/%Y %H:%M:%S') if mercado.data_jogo else None,
                'opcao_entrada': mercado.opcao_entrada,
                'resultado_estatistica': mercado.resultado_estatistica
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
            data = json.loads(request.body)
            event_ids = data.get('event_ids', [])
            action = data.get('action')
            valor_entrada_total = Decimal(str(data.get('valor_entrada_total', 0)))
            valor_entrada_rateado = Decimal(str(data.get('valor_entrada_rateado', 0)))
            odd_combinada = Decimal(str(data.get('odd_combinada', 1.0)))
            retorno_esperado = Decimal(str(data.get('retorno_esperado', 0)))
            
            if not event_ids or action not in ['aceitar', 'recusar']:
                return JsonResponse({
                    'success': False,
                    'message': 'Parâmetros inválidos.'
                }, status=400)
            
            entradas = Entrada.objects.filter(id_event__in=event_ids)
            
            if len(entradas) != len(event_ids):
                return JsonResponse({
                    'success': False,
                    'message': 'Alguns eventos não foram encontrados.'
                }, status=400)
            
            cod_multipla = f"ML-{timezone.now().strftime('%Y%m%d%H%M%S')}"
            
            for entrada in entradas:
                aposta = Aposta.objects.filter(entrada__id_event=entrada.id_event).first()
                
                if aposta and aposta.is_multipla:
                    return JsonResponse({
                        'success': False,
                        'message': f'O evento {entrada.id_event} já faz parte de uma múltipla.'
                    }, status=400)
            
            ciclos_validos = Ciclo.objects.filter(
                Q(data_inicial__gte=min(entrada.data_jogo for entrada in entradas)) |
                Q(data_final__lte=max(entrada.data_jogo for entrada in entradas))
            )
            
            if not ciclos_validos.exists():
                return JsonResponse({
                    'success': False,
                    'message': 'Não existe um ciclo válido para esta múltipla.'
                }, status=400)
            
            ciclo = ciclos_validos.first()
            
            if action == 'aceitar':
                if valor_entrada_total <= 0:
                    return JsonResponse({
                        'success': False,
                        'message': 'Valor de entrada inválido.'
                    }, status=400)
                
                if valor_entrada_total > ciclo.valor_disponivel_entrada:
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
                            valor=valor_entrada_rateado,
                            retorno=retorno_esperado,
                            is_multipla = True,
                            cod_multipla = cod_multipla
                        )
                    elif action == 'recusar':
                        entrada.opcao_entrada = "R"
                        
                    entrada.save()
                    aposta.save()
                    
                # Atualizar saldo disponível do ciclo
                ciclo.valor_disponivel_entrada -= valor_entrada_total
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
        
        datas_formatadas = []
        
        for data_str in datas:
            try:
                data = datetime.strptime(data_str, '%d/%m/%Y %H:%M:%S')
            except ValueError:
                try:
                    data = datetime.fromisoformat(data_str.replace('Z', '+00:00'))
                except ValueError:
                    return JsonResponse({
                        'success': False,
                        'message': f'Formato de data inválido: {data_str}'
                    }, status=400)
            
            datas_formatadas.append(data)
        
        ciclo = Ciclo.objects.filter(
            Q(data_inicial__gte=min(datas_formatadas)) |
            Q(data_final__lte=max(datas_formatadas))
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
        
    
def listar_owner_ball_sf(request):
    page = request.GET.get('page', 1)
    items_per_page = request.GET.get('items_per_page', 10)
    
    try:
        items_per_page = int(items_per_page)
        if items_per_page > 50:
            items_per_page = 50
    except ValueError:
        items_per_page = 10
    
    sfs_owner_ball = VwMercadoOwnerBallSfHome.objects.all()
    
    paginator = Paginator(sfs_owner_ball, items_per_page)
    
    try:
        paginator_sf_ob = paginator.page(page)
    except PageNotAnInteger:
        paginator_sf_ob = paginator.page(1)
    except EmptyPage:
        paginator_sf_ob = paginator.page(paginator.num_pages)
    
    data = []
    for sf in paginator_sf_ob:
        # TODO IMPLEMENTAR CHAMADA A API http://127.0.0.1:8080/statistic-overall PARA ATUALIAR O VALOR NA TELA
        data.append({
                'id_event': sf.id_event,
                'mercado': sf.mercado,
                'odd': sf.odd,
                'home_actual': sf.home_actual,
                'away_actual': sf.away_actual,
                'data_jogo': sf.data_jogo.strftime('%Y-%m-%d %H:%M:%S') if sf.data_jogo else None
            })
        
    return JsonResponse({
            'success': True,
            'mercados': data,
            'pagination': {
                'current_page': paginator_sf_ob.number,
                'total_pages': paginator.num_pages,
                'items_per_page': items_per_page,
                'total_items': paginator.count
            }
        })
    
# TODO melhorar logica para mudança de odd
def _verificar_mudanca_odd(entradas):
    for entrada in entradas:
        odds_change = OddChange.objects.filter(id_event=entrada.id_event).all()
        print(type(odds_change))
        if odds_change:
            for odd_change in odds_change:
                mudanca_rel_last = odd_change.home_change_from_last
                if mudanca_rel_last == 0 or mudanca_rel_last is None:
                    entrada.odd_change = 'P'
                elif mudanca_rel_last > 0:
                    entrada.odd_change = 'S'
                elif mudanca_rel_last < 0:
                    entrada.odd_change = 'D'
                entrada.save()
                
                
def atualizar_odd_change(request, id_evento):
    try:
        api_base_url = "http://127.0.0.1:8080"
        try:
            response = requests.get(
                f'{api_base_url}/odd-change/{id_evento}',
                timeout=5
            )
            
            resultado_estatistica = atualizar_statistica_overall(request, id_evento) # TODO REFATORAR
            
            if response.status_code == 200 or resultado_estatistica:
                return JsonResponse({
                    'success': True,
                    'message': 'Atualizaçao de odd recuperada com sucesso',
                    'oddChange': response.json(),
                    'statisticOverall': resultado_estatistica
                }, status=200)
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro de conexão ao buscar odd-change para evento {id_evento}: {str(e)}")
            
    except Exception as e:
            logger.error(f"Erro geral ao chamar API de odd-change: {str(e)}") 
            

@require_POST          
def atualizar_odd_status(request):
    try:
        data = json.loads(request.body)
        
        if not data:
            return JsonResponse({
                'success': False,
                'message': 'Nenhuma dado fornecido.'
            }, status=400)
        
        entrada = Entrada.objects.filter(id_event=data.get('event_id')).first()
        
        if not entrada:
            return JsonResponse({
                'sucess': False,
                'message': 'Entrada não encontrada'
            }, status=400)
            
        entrada.odd = data.get('odd_value')
        entrada.odd_change = data.get('odd_change')
        entrada.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Valor e status da odd atualizada com sucesso'
        }, status=200)          
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Erro ao atualizar odd change: {str(e)}'
        }, status=500)
        
        
def listar_owner_ball_favorito_home(request):
    page = request.GET.get('page', 1)
    items_per_page = request.GET.get('items_per_page', 10)
    
    try:
        items_per_page = int(items_per_page)
        if items_per_page > 50:
            items_per_page = 50
    except ValueError:
        items_per_page = 10
    
    favoritos_home = VwMercadoOwnerBallFavoritoHome.objects.all()
    
    paginator = Paginator(favoritos_home, items_per_page)
    
    try:
        paginator_sf_ob = paginator.page(page)
    except PageNotAnInteger:
        paginator_sf_ob = paginator.page(1)
    except EmptyPage:
        paginator_sf_ob = paginator.page(paginator.num_pages)
    
    data = []
    for favorito_home in paginator_sf_ob:
        data.append({
                'id': favorito_home.id,
                'mercado': favorito_home.entrada_mercado,
                'odd': favorito_home.odd,
                'data_jogo': favorito_home.data_jogo.strftime('%Y-%m-%d %H:%M:%S') if favorito_home.data_jogo else None
            })
        
    return JsonResponse({
            'success': True,
            'mercados': data,
            'pagination': {
                'current_page': paginator_sf_ob.number,
                'total_pages': paginator.num_pages,
                'items_per_page': items_per_page,
                'total_items': paginator.count
            }
        })
    
    
def listar_owner_ball_under_2_5(request):
    page = request.GET.get('page', 1)
    items_per_page = request.GET.get('items_per_page', 10)
    
    try:
        items_per_page = int(items_per_page)
        if items_per_page > 50:
            items_per_page = 50
    except ValueError:
        items_per_page = 10
    
    under_2_5 = VwMercadoOwnerBallUnder2_5.objects.all()
    
    paginator = Paginator(under_2_5, items_per_page)
    
    try:
        paginator_under_2_5_ob = paginator.page(page)
    except PageNotAnInteger:
        paginator_under_2_5_ob = paginator.page(1)
    except EmptyPage:
        paginator_under_2_5_ob = paginator.page(paginator.num_pages)
    
    data = []
    for under_2_5 in paginator_under_2_5_ob:
        data.append({
                'id': under_2_5.id,
                'mercado': under_2_5.entrada_mercado,
                'odd': under_2_5.odd,
                'data_jogo': under_2_5.data_jogo.strftime('%Y-%m-%d %H:%M:%S') if under_2_5.data_jogo else None
            })
        
    return JsonResponse({
            'success': True,
            'mercados': data,
            'pagination': {
                'current_page': paginator_under_2_5_ob.number,
                'total_pages': paginator.num_pages,
                'items_per_page': items_per_page,
                'total_items': paginator.count
            }
        })
 
    
def atualizar_statistica_overall(request, id_evento):
    try:
        api_base_url = "http://127.0.0.1:8080"
        try:
            response = requests.get(
                f'{api_base_url}/statistic-overall/{id_evento}',
                timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                resultado_bool = data['resultado'] == 1
                entrada = Entrada.objects.filter(id_event=id_evento).first()
                entrada.resultado_estatistica = resultado_bool
                entrada.save()
                
                return entrada.resultado_estatistica
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro de conexão ao buscar odd-change para evento {id_evento}: {str(e)}")
            
    except Exception as e:
            logger.error(f"Erro geral ao chamar API de odd-change: {str(e)}") 