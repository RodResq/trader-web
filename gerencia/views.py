from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.db.models import Sum
from django.http import JsonResponse
from django.db import transaction
from django.db.models import Sum
from analytics.models import Aposta
from decimal import Decimal
from datetime import datetime
from .models import GerenciaCiclo
from .forms import GerenciaForm
from owner_ball.models import CycleManagerOwnerBall, BetOwnerBall
from shared.enums import EventOriginEnum, BetsResultEnum
from rest_framework import status


def gerencia(request):
    manger_score_data = GerenciaCiclo.objects.all()
    cycle_maneger_owner_ball = CycleManagerOwnerBall.objects.all();
    
    
    results_bet_score_data = []
    results_bet_owner_ball = []
    
    for gerencia in manger_score_data:
        apostas = Aposta.objects.filter(ciclo=gerencia.ciclo)
        
        quantiade_apostas = apostas.count()
        
        sum_total_apostas = apostas.aggregate(
            total_valor=Sum('valor', default=0)
        )['total_valor']
        
        sum_total_retorno = apostas.aggregate(
            total_retorno=Sum('retorno', defeault=0)
        )['total_retorno']
        
        if quantiade_apostas > 0:
            gerencia.valor_total_entradas = sum_total_apostas
            gerencia.valor_total_retorno = sum_total_retorno
            gerencia.qtd_total_entrada = quantiade_apostas
            gerencia.save()
        
        resultado_dict = {
            'gerencia': gerencia,
            'apostas': apostas
        }
        
        results_bet_score_data.append(resultado_dict)
        
    for manager in cycle_maneger_owner_ball:
        bets = BetOwnerBall.objects.filter(cycle_owner_ball=manager.cycle).all()
        
        quantity_entries = bets.count()
        
        sum_total_values_entries = bets.aggregate(
            total_value=Sum('value_bet', default=0)
        )['total_value']
        
        sum_total_return_values = bets.aggregate(
            total_return=Sum('return_bet', default=0)
        )['total_return']
        
        if quantity_entries > 0:
            manager.total_entries_value = sum_total_values_entries
            manager.total_return_value = sum_total_return_values
            manager.total_entries_number = quantity_entries
            manager.save()
        
        result_dict = {
            'manager': manager,
            'bets': bets
        }
        
        results_bet_owner_ball.append(result_dict)
    
    return render(request, 'analytics/gerencia/gerencia.html', {
            'resultado_apostas': results_bet_score_data,
            'results_bet_owner_ball': results_bet_owner_ball
        }
    )


def gerencia_edit(request, pk=None):
    """Edita um registro de lucro existente ou cria um novo."""
    if pk:
        gerencia = get_object_or_404(GerenciaCiclo, pk=pk)
    else:
        gerencia = None

    if request.method == 'POST':
        form = GerenciaForm(request.POST, instance=gerencia)
        if form.is_valid():
            form.save()
            messages.success(request, 'Registro de gerência salvo com sucesso!')
            return redirect('analytics:gerencia:index')
    else:
        form = GerenciaForm(instance=gerencia)

    context = {
        'form': form,
        'gerencia': gerencia,
        'titulo': 'Editar Gerencia Entradas' if gerencia else 'Novo Registro de Gerencia'
    }
    return render(request, 'analytics/gerencia/gerencia_form.html', context)

def gerencia_delete(request, pk):
    """Exclui um registro de gerencia."""
    gerencia = get_object_or_404(GerenciaCiclo, pk=pk)
    
    if request.method == 'POST':
        gerencia.delete()
        messages.success(request, 'Registro de lucro excluído com sucesso!')
        return redirect('analytics:gerencia:index')
        
    return render(request, 'analytics/gerencia/gerencia_confirm_delete.html', {'gerencia': gerencia})


def gerencia_resultado(request):
    if "eventId" in request.GET and "resultado" in request.GET:
        event_id = request.GET['eventId']
        event_origin = request.GET['eventOrigin']
        resultado = request.GET.get('resultado')
        valor_total_retorno = 0
        
        if event_origin == EventOriginEnum.SCORE_DATA.value:
            aposta = Aposta.objects.filter(entrada__id_event=event_id).first()
            
            if not aposta:
                return JsonResponse({
                    'success': False,
                    'message': f'Não existe aposta score data registrada'
                }, status=400)
                
            if ((BetsResultEnum.GREEN.value == aposta.resultado and aposta.resultado == resultado) or 
                (BetsResultEnum.RED.value == aposta.resultado and aposta.resultado == resultado)):
                return JsonResponse({
                    'success': False,
                    'message': f'Resultado da aposta já adicionado ao valor principal'
                }, status=200)
                
            gerencia_ciclo = GerenciaCiclo.objects.filter(ciclo=aposta.ciclo).first()

            if not gerencia_ciclo:
                return JsonResponse({
                'success': False,
                'message': f'Não existe ciclo para registrar o valor de retorno da aposta'
            }, status=400)
                
            with transaction.atomic():
                if BetsResultEnum.RED.value == resultado:
                    valor_total_retorno = aposta.retorno
                    aposta.retorno = 0
                
                aposta.resultado = resultado
                aposta.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Resultado da aposta registrado',
                'data': {
                    'idEvent': event_id,
                    'resultado': resultado,
                    'valorIndividualAposta': valor_total_retorno
                }            
            }, status=status.HTTP_200_OK)
            
        elif event_origin == EventOriginEnum.OWNER_BALL.value:
            bet_owner_ball = BetOwnerBall.objects.filter(entry__id_event=event_id).first()
            if not bet_owner_ball:
                return JsonResponse({
                    'success': False,
                    'message': f'Não existe aposta owner ball registrada'
                }, status=400)
                
            if ((BetsResultEnum.GREEN.value == bet_owner_ball.result and bet_owner_ball.result == resultado) or 
                (BetsResultEnum.RED.value == bet_owner_ball.result and bet_owner_ball.result == resultado)):
                return JsonResponse({
                    'success': False,
                    'message': f'Resultado da aposta já adicionado ao valor principal'
                }, status=200)
                
            cycle_manager = CycleManagerOwnerBall.objects.filter(cycle=bet_owner_ball.cycle_owner_ball).first()
            if not cycle_manager:
                    return JsonResponse({
                    'success': False,
                    'message': f'Não existe ciclo para registrar o valor de retorno da aposta'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            with transaction.atomic():
                if BetsResultEnum.RED.value == resultado:
                    valor_total_retorno = bet_owner_ball.return_bet
                    bet_owner_ball.return_bet = 0;
                
                bet_owner_ball.result = resultado
                bet_owner_ball.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Resultado da aposta owner basll registrado',
                'data': {
                    'idEvent': event_id,
                    'resultado': resultado,
                    'valorIndividualAposta': valor_total_retorno
                }            
            }, status=status.HTTP_200_OK)
    else:
        return JsonResponse({
            'success': False,
            'message': 'Algum paramentro obrigatorio esta faltando'
        }, status=status.HTTP_400_BAD_REQUEST)         
        
def desempenho_semanal_json(request):
    """
    Retorna dados de desempenho de todos os ciclos em formato JSON para uso em gráficos.
    Inclui todos os tipos de ciclos (Semanal, Quinzenal, Mensal) para permitir comparações.
    """
    try:
        # Obter todos os ciclos com suas gerências
        ciclos_gerenciados = GerenciaCiclo.objects.select_related('ciclo').all().order_by('ciclo__data_inicial')
        
        # Preparar dados para o gráfico
        dados = []
        
        for gerencia in ciclos_gerenciados:
            ciclo = gerencia.ciclo
            
            if not ciclo:
                continue
                
            # Obter categoria do ciclo
            categoria_display = ciclo.get_categoria_display()
            
            # Obter dados de apostas para este ciclo
            apostas_ciclo = Aposta.objects.filter(ciclo=ciclo)
            qtd_apostas = apostas_ciclo.count()
            
            # Determinar valores acumulados
            valor_total_entrada = gerencia.valor_total_entrada or Decimal('0.00')
            valor_total_retorno = gerencia.valor_total_retorno or Decimal('0.00')
            
            # Calcular lucratividade
            lucratividade = 0
            if valor_total_entrada and valor_total_entrada > 0:
                lucratividade = float(((valor_total_retorno - valor_total_entrada) / valor_total_entrada) * 100)
            
            # Formatar datas para exibição
            data_inicial = ciclo.data_inicial.strftime('%d/%m/%Y')
            data_final = ciclo.data_final.strftime('%d/%m/%Y')
            
            # Adicionar dados do ciclo
            dados.append({
                'categoria': categoria_display,
                'periodo': f"{data_inicial} a {data_final}",
                'data_inicial': data_inicial,
                'data_final': data_final,
                'valor_entrada': float(valor_total_entrada),
                'valor_retorno': float(valor_total_retorno),
                'lucratividade': round(lucratividade, 2),
                'qtd_entradas': qtd_apostas
            })
        
        # Ordenar por data inicial
        dados = sorted(dados, key=lambda x: datetime.strptime(x['data_inicial'], '%d/%m/%Y'))
        
        # Análise de desempenho
        analise = {}
        if dados:
            # Dados gerais
            total_entradas = sum(item['valor_entrada'] for item in dados)
            total_retornos = sum(item['valor_retorno'] for item in dados)
            total_apostas = sum(item['qtd_entradas'] for item in dados)
            
            # Lucratividade
            lucro_total = total_retornos - total_entradas
            lucratividade_media = 0
            if total_entradas > 0:
                lucratividade_media = (lucro_total / total_entradas) * 100
            
            # Encontrar melhores e piores resultados
            melhor_resultado = max(dados, key=lambda x: x['lucratividade']) if dados else None
            pior_resultado = min(dados, key=lambda x: x['lucratividade']) if dados else None
            
            # Análises por categoria
            categorias = {}
            for item in dados:
                categoria = item['categoria']
                if categoria not in categorias:
                    categorias[categoria] = {
                        'total_entrada': 0,
                        'total_retorno': 0,
                        'qtd_ciclos': 0,
                        'ciclos': []
                    }
                
                categorias[categoria]['total_entrada'] += item['valor_entrada']
                categorias[categoria]['total_retorno'] += item['valor_retorno']
                categorias[categoria]['qtd_ciclos'] += 1
                categorias[categoria]['ciclos'].append({
                    'periodo': item['periodo'],
                    'lucratividade': item['lucratividade']
                })
            
            # Calcular lucratividade por categoria
            for cat, dados_cat in categorias.items():
                if dados_cat['total_entrada'] > 0:
                    dados_cat['lucratividade'] = ((dados_cat['total_retorno'] - dados_cat['total_entrada']) / 
                                                dados_cat['total_entrada']) * 100
                else:
                    dados_cat['lucratividade'] = 0
                
                # Arredondar valores para exibição
                dados_cat['total_entrada'] = round(dados_cat['total_entrada'], 2)
                dados_cat['total_retorno'] = round(dados_cat['total_retorno'], 2)
                dados_cat['lucratividade'] = round(dados_cat['lucratividade'], 2)
            
            # Preencher objeto de análise
            analise = {
                'total_entradas': round(total_entradas, 2),
                'total_retornos': round(total_retornos, 2),
                'lucro_total': round(lucro_total, 2),
                'lucratividade_media': round(lucratividade_media, 2),
                'total_apostas': total_apostas,
                'melhor_resultado': melhor_resultado,
                'pior_resultado': pior_resultado,
                'categorias': categorias
            }
        
        return JsonResponse({
            'success': True,
            'dados': dados,
            'analise': analise
        })
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
