import json
import json
import asyncio
import aiohttp
import requests
import logging
import random

from decimal import Decimal
from datetime import datetime

from django.utils import timezone
from django.db import transaction
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from django.views.decorators.http import require_POST
from django.core.exceptions import ValidationError
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.db.models import Sum, Q
from django.contrib.auth.decorators import login_required

from rest_framework.decorators import api_view 
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework import status
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated

from analytics.models import Entrada, Aposta, OddChange
from analytics.helpers import dump_mercados_para_entrada
from analytics.forms import AceitarApostaForm
from analytics.serializers import (
    EntryResultSuperFavoriteSerializer, 
    CustomResponseEntryResultSuperFavoriteSerializer
)

from gerencia.models import GerenciaCiclo
from ciclo.models import Ciclo 
from shared.utils import CustomPagination

from owner_ball.models import SuperFavoriteHomeBallOwnerEntry, BetOwnerBall, CycleOwnerBall
from shared.enums import EventOriginEnum

logger = logging.getLogger(__name__)

COLORES_WEIGHT = [
    "#1a237e",  # Azul escuro
    "#880e4f",  # Rosa escuro
    "#4a148c",  # Roxo escuro
    "#311b92",  # Índigo escuro
    "#1b5e20",  # Verde escuro
    "#33691e",  # Verde lima escuro
    "#f57f17",  # Amarelo escuro
    "#e65100",  # Laranja escuro
    "#bf360c",  # Laranja avermelhado
    "#3e2723",  # Marrom escuro
    "#F54927",  # Vermelho claro
    "#b71c1c",  # Vermelho escuro
    "#01579b",  # Azul claro escuro
    "#004F52",  # Ciano escuro
    "#eead0e",
    "#5a367a",
    "#789012",
    "#82aecc",
    "#d77c59",
    "#4d0303",
    "#2f334c",
    "#6f7387",
    "#3e6a40"
]
      

@login_required
def index(request, format=None):
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
    
    total_investido = GerenciaCiclo.objects.aggregate(total=Sum('valor_total_entrada'))
    soma_retorno = GerenciaCiclo.objects.aggregate(total=Sum('valor_total_retorno'))
    
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
        'total_investido': total_investido['total'],
        'soma_total_retorno': soma_retorno['total'],
        'ganho_perda': (soma_retorno['total'] - total_investido['total']),
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
                if evento_id == 13292666:#TODO Rever Condição
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
                    
        entradas = Entrada.objects.all()
        
        # Create paginator
        paginator = Paginator(entradas, items_per_page)
        
        try:
            paginator_entradas = paginator.page(page)
        except PageNotAnInteger:
            paginator_entradas = paginator.page(1)
        except EmptyPage:
            paginator_entradas = paginator.page(paginator.num_pages)
        
        data = []
        for entrada in paginator_entradas:
            data.append({
                'id_event': entrada.id_event,
                'name_home': entrada.name_home,
                'icon_home_data_url': entrada.icon_home_data_url,
                'placar': entrada.mercado,
                'name_away': entrada.name_away,
                'icon_away_data_url': entrada.icon_away_data_url,
                'odd_change': entrada.odd_change,
                'odd': float(entrada.odd) if entrada.odd else 0,
                'home_actual': entrada.home_actual,
                'away_actual': entrada.away_actual,
                'data_jogo': entrada.data_jogo.strftime('%d/%m/%Y %H:%M:%S') if entrada.data_jogo else None,
                'opcao_entrada': entrada.opcao_entrada,
                'resultado_estatistica': entrada.resultado_estatistica,
                'resultado_entrada': entrada.resultado_entrada,
                'next_event_priority': entrada.next_event_priority
            })
        return JsonResponse({
            'success': True,
            'mercados': data,
            'pagination': {
                'current_page': paginator_entradas.number,
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
        event_origin = request.GET.get('event_origin')
        
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
              
            if event_origin ==  EventOriginEnum.SCORE_DATA.value:
                entrada = get_object_or_404(Entrada, id_event=event_id)
                entrada.odd = nova_odd
                entrada.save()
                
                return JsonResponse({
                    'success': True,
                    'message': f'Odd Score Data do Id Event: {entrada.id_event} atualizada com sucesso!',
                    'data': {
                        'id_event': entrada.id_event,
                        'odd': float(entrada.odd),
                        'mercado': entrada.mercado
                    }
                })
            elif event_origin == EventOriginEnum.OWNER_BALL.value:
                super_favorite_ob = get_object_or_404(SuperFavoriteHomeBallOwnerEntry, id_event=event_id)
                super_favorite_ob.odd = nova_odd
                super_favorite_ob.save()
                
                return JsonResponse({
                    'success': True,
                    'message': f'Odd OwnerBall do Id Event: {super_favorite_ob.id_event} atualizada com sucesso!',
                    'data': {
                        'id_event': super_favorite_ob.id_event,
                        'odd': float(super_favorite_ob.odd)
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
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            event_ids = data.get('event_ids', [])
            action = data.get('action')
            valor_entrada_total = Decimal(str(data.get('valor_entrada_total', 0)))
            valor_entrada_rateado = Decimal(str(data.get('valor_entrada_rateado', 0)))
            odd_combinada = Decimal(str(data.get('odd_combinada', 1.0)))
            retorno_esperado = Decimal(str(data.get('retorno_esperado', 0)))
            event_origin = str(data.get('event_origin'))
            cycle_id = data.get('cycle_id')
            
            if not event_ids or action not in ['aceitar', 'recusar']:
                return JsonResponse({
                    'success': False,
                    'message': 'Parâmetros inválidos.'
                }, status=400)
                
            cod_multipla = f"ML-{timezone.now().strftime('%Y%m%d%H%M%S')}"
            color_multipla = random.choice(COLORES_WEIGHT)
            
            if event_origin == EventOriginEnum.SCORE_DATA.value:
                entradas = Entrada.objects.filter(id_event__in=event_ids)
                
                if len(entradas) != len(event_ids):
                    return JsonResponse({
                        'success': False,
                        'message': 'Alguns eventos não foram encontrados.'
                    }, status=400)
                
                for entrada in entradas:
                    aposta = Aposta.objects.filter(entrada__id_event=entrada.id_event).first()
                    if aposta and aposta.is_multipla:
                        return JsonResponse({
                            'success': False,
                            'message': f'O evento {entrada.id_event} já faz parte de uma múltipla.'
                        }, status=400)
                
                ciclo = get_object_or_404(Ciclo, id=cycle_id)
                
                if not ciclo:
                    return JsonResponse({
                        'success': False,
                        'message': 'Não existe um ciclo válido para esta múltipla.'
                    }, status=400)
                
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
                            aposta = Aposta.objects.create(
                                entrada=entrada,  
                                ciclo=ciclo,
                                valor=valor_entrada_rateado,
                                retorno=retorno_esperado,
                                is_multipla = True,
                                cod_multipla = cod_multipla,
                                color_multipla = color_multipla
                            )
                        elif action == 'recusar':
                            entrada.opcao_entrada = "R"
                            
                        entrada.save()
                        
                    # Atualizar saldo disponível do ciclo
                    ciclo.valor_disponivel_entrada -= valor_entrada_total
                    ciclo.save()
                
                return JsonResponse({
                    'success': True,
                    'message': f'Múltipla {"aceita" if action == "aceitar" else "recusada"} com sucesso!',
                    'data': {
                        'cod_multipla': cod_multipla,
                        'color_multipla': color_multipla,
                        'odd_combinada': float(odd_combinada),
                        'quantidade_eventos': len(event_ids),
                        'ciclo': ciclo.id
                    }
                })
                
            elif event_origin == EventOriginEnum.OWNER_BALL.value:
                entries_owner_ball = SuperFavoriteHomeBallOwnerEntry.objects.filter(id_event__in=event_ids)
                
                if len(entries_owner_ball) != len(event_ids):
                    return JsonResponse({
                        'success': False,
                        'message': 'Alguns eventos não foram encontrados.'
                    }, status=400)
                    
                for entry in entries_owner_ball:
                    bet_owner_ball = BetOwnerBall.objects.filter(entry__id_event=entry.id_event).first()
                    if bet_owner_ball and bet_owner_ball.is_multiple:
                        return JsonResponse({
                            'success': False,
                            'message': f'O evento {entry.id_event} já faz parte de uma múltipla.'
                        }, status=400)
                        
                        
                        
                cycle_owner_ball = get_object_or_404(CycleOwnerBall, id=cycle_id)
                
                if action == 'aceitar':
                    if valor_entrada_total <= 0:
                        return JsonResponse({
                            'success': False,
                            'message': 'Valor de entrada inválido.'
                        }, status=400)
                        
                    if valor_entrada_total > cycle_owner_ball.available_value:
                        return JsonResponse({
                            'success': False,
                            'message': f'Valor excede o disponível (R$ {ciclo.valor_disponivel_entrada})'
                        }, status=400)
                        
                        
                with transaction.atomic():
                    for entry in entries_owner_ball:
                        if action == 'aceitar':
                            entry.entry_option = "A"
                            aposta = BetOwnerBall.objects.create(
                                entry=entry,  
                                cycle_owner_ball=cycle_owner_ball,
                                is_multiple = True,
                                value_bet=valor_entrada_rateado,
                                return_bet=retorno_esperado,
                                cod_multiple = cod_multipla,
                                color_multiple = color_multipla
                            )
                        elif action == 'recusar':
                            entrada.entry_option = "R"
                        entry.save()
                        
                    cycle_owner_ball.available_value -= valor_entrada_total
                    cycle_owner_ball.save()
            
            return JsonResponse({
                        'success': True,
                        'message': f'Múltipla {"aceita" if action == "aceitar" else "recusada"} com sucesso!',
                        'data': {
                            'cod_multipla': cod_multipla,
                            'color_multipla': color_multipla,
                            'odd_combinada': float(odd_combinada),
                            'quantidade_eventos': len(event_ids),
                            'ciclo': cycle_owner_ball.id
                        }
                    }, status=status.HTTP_200_OK)
        
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
            data_inicial__lte=min(datas_formatadas),
            data_final__gte=max(datas_formatadas)
        ).first()
        
        if not ciclo:
            return JsonResponse({
                'success': False,
                'message': 'Não existe um ciclo válido para todas as datas selecionadas.'
            })
        
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
            
            if response.status_code == 200:
                return JsonResponse({
                    'success': True,
                    'oddChange': response.json(),
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
            
        event_origin = data.get('event_origin')
        event_id = data.get('event_id')
        odd = data.get('odd_value')
        odd_change = data.get('odd_change')
        
        if event_origin == EventOriginEnum.SCORE_DATA.value:
            entrada = get_object_or_404(Entrada, id_event=event_id) 
            entrada.odd = odd
            entrada.odd_change = odd_change
            entrada.save()
        
            return JsonResponse({
                'success': True,
                'message': 'Valor e status da odd score data atualizada com sucesso'
            }, status=200)  
            
        elif event_origin == EventOriginEnum.OWNER_BALL.value:
            sf_owner_ball = get_object_or_404(SuperFavoriteHomeBallOwnerEntry, id_event=event_id) 
            sf_owner_ball.odd =  odd
            sf_owner_ball.odd_change = odd_change
            sf_owner_ball.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Valor e status da odd owner ball atualizada com sucesso'
            }, status=200) 
            
    except Entrada.DoesNotExist:
        return JsonResponse({
            'success': False,
            'message': f'Entrada score data nao existe para atualizar odd change: {str(e)}'
        }, status=500)
        
    except SuperFavoriteHomeBallOwnerEntry.DoesNotExist:
        return JsonResponse({
            'success': False,
            'message': f'Entrada owner ball nao existe para atualizar odd change: {str(e)}'
        }, status=500)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Erro ao atualizar odd change: {str(e)}'
        }, status=500)
        
    
def atualizar_statistica_overall(request, id_evento):
    # TODO Recuperar Valores passados como query params
    if request.method == 'GET':
        event_origin = request.GET.get('event_origin')
        try:
            api_base_url = "http://127.0.0.1:8080"
            try:
                response = requests.get(
                    f'{api_base_url}/statistic-overall/{id_evento}',
                    timeout=5
                )
                if response.status_code == 200:
                    data = response.json()
                    
                    if not data['success']:
                        return JsonResponse(data, status=404)
                        
                    entrada = None
                    statistic_result = data['resultado']
                    if event_origin == EventOriginEnum.SCORE_DATA.value:
                        entrada = Entrada.objects.filter(id_event=id_evento).first()
                        entrada.resultado_estatistica = statistic_result
                         
                    elif event_origin == EventOriginEnum.OWNER_BALL.value:
                        entrada = SuperFavoriteHomeBallOwnerEntry.objects.filter(id_event=id_evento).first()
                        entrada.statistic_result = statistic_result
                    entrada.save()
                    
                    return JsonResponse({
                        'success': True,
                        'statistic': statistic_result,
                        'message': 'O resultado do calculo estatico foi atualizado com sucesso'
                    }, status=200)
                else:
                    logger.error('Erro interno na api statistics')
                
            except requests.exceptions.RequestException as e:
                logger.error(f"Erro de conexão ao buscar odd-change para evento {id_evento}: {str(e)}")
                
        except Exception as e:
                logger.error(f"Erro geral ao chamar API de odd-change: {str(e)}") 
                

def atualizar_statistica_overall_team(request, id_team):
    if request.method == 'GET':
        
        try:
            api_base_url = "http://127.0.0.1:8080"
            try:
                response = requests.get(
                    f'{api_base_url}/statistic-overall/team/{id_team}',
                    timeout=5
                )
                if response.status_code == 200:
                    data = response.json()
                    
                    if not data['success']:
                        return JsonResponse(data, status=404)
                        
                    data = data['data']
                    
                    return JsonResponse({
                        'success': True,
                        'data': data,
                        'message': 'O resultado estatico foi recuperado com sucesso'
                    }, status=200)
                else:
                    logger.error('Erro interno na api statistics')
                
            except requests.exceptions.RequestException as e:
                logger.error(f"Erro de conexão ao buscar estatistica do team {id_team}: {str(e)}")
                
        except Exception as e:
                logger.error(f"Erro geral ao chamar API de estatistica do team: {str(e)}")
          
            
def comparar_statistica_teams(request, id_home, id_away):
    if request.method == 'GET':
        event_origin = request.GET.get('event_origin')
        id_event = request.GET.get('id_event')
        try:
            api_base_url = "http://127.0.0.1:8080"
            try:
                response = requests.get(
                    f'{api_base_url}/statistic-compare/teams/{id_home}/{id_away}',
                    timeout=5
                )
                if response.status_code == 200:
                    data = response.json()
                    
                    if not data['success']:
                        return JsonResponse(data, status=404)
                    
                    final_result = data['final_result'] 
                    if final_result:
                        entrada = None
                        if event_origin == EventOriginEnum.SCORE_DATA.value:
                            entrada = Entrada.objects.filter(id_event=id_event).first()
                            entrada.resultado_estatistica = final_result
                            
                        elif event_origin == EventOriginEnum.OWNER_BALL.value:
                            entrada = SuperFavoriteHomeBallOwnerEntry.objects.filter(id_event=id_event).first()
                            entrada.statistic_result = final_result
                        entrada.save()
                        
                        data = data['data']
                        if data:
                            return JsonResponse({
                                'success': True,
                                'data': data,
                                'message': 'Dados da comparacao recuperado com sucesso'
                            }, status=200)
                        else:
                           return JsonResponse({
                                'success': False,
                                'message': 'Erro ao recuperar dados da comparacao'
                            }, status=500) 
                    else:
                        return JsonResponse({
                            'success': False,
                            'message': f'Resultado Final da Comparacao: {final_result}'
                        }, status=500)
                else:
                    logger.error('Erro interno na api compare statistics')
                
            except requests.exceptions.RequestException as e:
                logger.error(f"Erro de conexão ao buscar estatistica dos times: {id_home} e {id_away}: {str(e)}")
                
        except Exception as e:
                logger.error(f"Erro geral ao chamar API de comparacao estatisticas dos times: {str(e)}")
            
            
@api_view(['PUT'])
def resultado_entrada(request, format=None):
    serializer = EntryResultSuperFavoriteSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({
            'success': False,
            'message': 'Parâmetros Invalidos.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
    validated_data = serializer.validated_data
    id_event = validated_data['id_event']
    entry_result = validated_data['entry_result']
    
    try:
        with transaction.atomic():
            super_favorites_home = get_object_or_404(Entrada, id_event=id_event)
            super_favorites_home.entry_result = entry_result
            super_favorites_home.save(update_fields=['entry_result'])
            
            response_serializer = CustomResponseEntryResultSuperFavoriteSerializer(super_favorites_home,many=False)
            return Response({
                'success': True,
                'message': 'Resultado entrada atualizado com sucesso.',
                'data': response_serializer.data
            }, status=status.HTTP_200_OK)
    except ValueError:
        return Response({
           'success': False,
           'message': ' ID Evento deve ser um numero valido.' 
        }, status=status.HTTP_400_BAD_REQUEST)
    except Entrada.DoesNotExist:
        return Response({
            'success': False,
            'message': f'Entrada Super Favorito Home nao encontrada para o evento ID: {id_event}'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f'Erro ao atualizar resultado da entrada {id_event}: {str(e)}')
        return Response({
            'success': False,
            'message': 'Erro interno do servidor ao processar a solicitação.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)  
                               
            
def get_event_vote(request):
    if request.method == 'GET':
        id_event = request.GET.get('event_id')
        event_origin = request.GET.get('event_origin')
        
        try:
            response = requests.get(f'http://127.0.0.1:8080/event/{id_event}/votes')
            data = response.json()
            print(data)
            if not data['success']:
                return JsonResponse({
                    'success': False,
                    'message': 'Erro ao recuperar dados da votacao'
                }, status=400)
                
            vote_home =  data['data']['vote']['voteHome']
            vote_away = data['data']['vote']['voteAway']
            vote_draw = data['data']['vote']['voteDraw']
            
            entrada = None
            if event_origin == EventOriginEnum.SCORE_DATA.value:
                entrada = get_object_or_404(Entrada, id_event=id_event)
            elif event_origin == EventOriginEnum.OWNER_BALL.value:
                entrada = get_object_or_404(SuperFavoriteHomeBallOwnerEntry, id_event=id_event)
            
            if entrada:
                entrada.event_vote_home = 'H' if vote_home > vote_away and vote_home > vote_draw else 'A'
                entrada.save()
                
            return JsonResponse({
                'success': True,
                'data': entrada.event_vote_home
            }, status=200)
            
        except requests.exceptions.RequestException as e:
            return JsonResponse({
                'sucess':False,
                'message': f'Erro ao recuperar voto: {str(e)}'
            }, status=500)