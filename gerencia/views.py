from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.contrib import messages
from analytics.models import Entrada, Aposta
from django.db.models import Q, Sum
from django.http import JsonResponse
from django.db import transaction
from django.db.models.functions import TruncMonth, TruncWeek, TruncDate
from django.db.models import Sum, F, Case, When, Value, IntegerField, FloatField, Count
from .models import GerenciaCiclo
from .forms import GerenciaForm
from ciclo.models import Ciclo

def gerencia(request):
    """Exibe a lista de registros de lucro."""
    gerencias = GerenciaCiclo.objects.all()
    
    resultado_apostas = []
    
    for gerencia in gerencias:
        apostas = Aposta.objects.filter(ciclo=gerencia.ciclo).all()
        
        quantiade_apostas = apostas.count()
        valor_total_apostas = apostas.aggregate(
            total_valor=Sum('valor', default=0)
        )['total_valor']
        
        if quantiade_apostas > 0:
            if valor_total_apostas != gerencia.valor_total_entrada:
                gerencia.valor_total_entrada = valor_total_apostas
                gerencia.qtd_total_entrada = quantiade_apostas
                gerencia.save()
        
        resultado_dict = {
            'gerencia': gerencia,
            'apostas': apostas
        }
        
        resultado_apostas.append(resultado_dict)
    
    return render(request, 'analytics/gerencia/gerencia.html', {'resultado_apostas': resultado_apostas})

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
    if "event_id" in request.GET and "resultado" in request.GET:
        event_id = request.GET['event_id']
        resultado = request.GET.get('resultado')
        valor_total_retorno = 0
        
        aposta = Aposta.objects.filter(entrada__id_event=event_id).first()
        
        if not aposta:
            return JsonResponse({
                'success': False,
                'message': f'Não existe aposta registrada'
            }, status=400)
            
        if "G" == aposta.resultado and aposta.resultado == resultado:
            return JsonResponse({
                'success': False,
                'message': f'Retorno já adicionado ao valor principal'
            }, status=200)
            
        if "R" == aposta.resultado and aposta.resultado == resultado:
            return JsonResponse({
                'success': False,
                'message': f'Retorno já excluído do valor principal'
            }, status=200)
        
        with transaction.atomic():
            aposta.resultado = resultado
            aposta.save()
            
            gerencia_ciclo = GerenciaCiclo.objects.filter(ciclo=aposta.ciclo).first()

            if not gerencia_ciclo:
                return JsonResponse({
                'success': False,
                'message': f'Não existe ciclo para registrar o valor de retorno da aposta'
            }, status=400)
                
            if "G" == aposta.resultado:
                gerencia_ciclo.valor_total_retorno += aposta.retorno;
                valor_total_retorno = gerencia_ciclo.valor_total_retorno
                gerencia_ciclo.save()
                
            if "R" == aposta.resultado:
                gerencia_ciclo.valor_total_retorno -= aposta.retorno;
                valor_total_retorno = gerencia_ciclo.valor_total_retorno
                gerencia_ciclo.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Resultado da aposta registrado',
            'data': {
                'id_event': event_id,
                'resultado': resultado,
                'valor_total_retorno': valor_total_retorno
            }            
        })
        
def desempenho_semanal_json(request):
    """
    Retorna dados de desempenho semanal em formato JSON para uso em gráficos.
    """
    try:
        # Obter ciclos semanais
        ciclos_semanais = Ciclo.objects.filter(categoria='S').order_by('data_inicial')
        
        # Preparar dados para o gráfico
        dados = []
        
        for ciclo in ciclos_semanais:
            # Obter gerência do ciclo
            gerencia = GerenciaCiclo.objects.filter(ciclo=ciclo).first()
             
            if gerencia:
                # Calcular lucratividade
                lucratividade = 0
                if gerencia.valor_total_entrada and gerencia.valor_total_entrada > 0:
                    lucratividade = float(((gerencia.valor_total_retorno - gerencia.valor_total_entrada) / gerencia.valor_total_entrada) * 100)
                
                data_inicial = ciclo.data_inicial.strftime('%d/%m/%Y')
                data_final = ciclo.data_final.strftime('%d/%m/%Y')
                
                # Adicionar dados do ciclo
                dados.append({
                    'periodo': f"{data_inicial} a {data_final}",
                    'data_inicial': data_inicial,
                    'data_final': data_final,
                    'valor_entrada': float(gerencia.valor_total_entrada),
                    'valor_retorno': float(gerencia.valor_total_retorno),
                    'lucratividade': round(lucratividade, 2),
                    'qtd_entradas': gerencia.qtd_total_entrada
                })
                
            # Análise de desempenho
            analise = {}
            if dados:
                total_entradas = sum(item['valor_entrada'] for item in dados)
                total_retornos = sum(item['valor_retorno'] for item in dados)
                
                if total_entradas > 0:
                    lucro_total = total_retornos - total_entradas
                    lucratividade_media = (lucro_total / total_entradas) * 100
                    
                    analise = {
                        'total_entradas': round(total_entradas, 2),
                        'total_retornos': round(total_retornos, 2),
                        'lucro_total': round(lucro_total, 2),
                        'lucratividade_media': round(lucratividade_media, 2),
                        'melhor_resultado': max(dados, key=lambda x: x['lucratividade']) if dados else None,
                        'pior_resultado': min(dados, key=lambda x: x['lucratividade']) if dados else None
                    }
            
            return JsonResponse({
                'success': True,
                'dados': dados,
                'analise': analise
            })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
        
        
def desempenho_mensal_json(request):
    """
    Retorna dados de desempenho mensal em formato JSON para uso em gráficos.
    """
    try:
        # Dados originais dos ciclos mensais
        ciclos_mensais = Ciclo.objects.filter(categoria='M').order_by('data_inicial')
        
        # Dados agrupados por mês para todos os ciclos
        dados_agrupados = []
        
        # Se não houver ciclos mensais, agrupar dados de todos os ciclos por mês
        if not ciclos_mensais.exists():
            # Agrupar apostas por mês
            apostas_por_mes = Aposta.objects.annotate(
                mes=TruncMonth('entrada__data_jogo')
            ).values('mes').annotate(
                valor_entrada=Sum('valor'),
                valor_retorno=Sum(Case(
                    When(resultado='G', then=F('retorno')),
                    When(resultado='R', then=Value(0)),
                    default=Value(0),
                    output_field=FloatField()
                )),
                qtd_entradas=Count('id')
            ).order_by('mes')
            
            for item in apostas_por_mes:
                # Calcular lucratividade
                lucratividade = 0
                if item['valor_entrada'] and item['valor_entrada'] > 0:
                    lucratividade = ((item['valor_retorno'] - item['valor_entrada']) / item['valor_entrada']) * 100
                
                # Formatar período
                mes_ano = item['mes'].strftime('%m/%Y')
                
                dados_agrupados.append({
                    'periodo': mes_ano,
                    'data_inicial': item['mes'].strftime('%d/%m/%Y'),
                    'data_final': item['mes'].replace(day=28).strftime('%d/%m/%Y'),  # Aproximado
                    'valor_entrada': float(item['valor_entrada']),
                    'valor_retorno': float(item['valor_retorno']),
                    'lucratividade': round(lucratividade, 2),
                    'qtd_entradas': item['qtd_entradas']
                })
        
        # Usar dados originais de ciclos mensais se disponíveis
        dados = []
        if ciclos_mensais.exists():
            for ciclo in ciclos_mensais:
                gerencia = GerenciaCiclo.objects.filter(ciclo=ciclo).first()
                
                if gerencia:
                    # Calcular lucratividade
                    lucratividade = 0
                    if gerencia.valor_total_entrada and gerencia.valor_total_entrada > 0:
                        lucratividade = float(((gerencia.valor_total_retorno - gerencia.valor_total_entrada) / gerencia.valor_total_entrada) * 100)
                    
                    # Formatar datas
                    data_inicial = ciclo.data_inicial.strftime('%d/%m/%Y')
                    data_final = ciclo.data_final.strftime('%d/%m/%Y')
                    
                    dados.append({
                        'periodo': ciclo.data_inicial.strftime('%m/%Y'),
                        'data_inicial': data_inicial,
                        'data_final': data_final,
                        'valor_entrada': float(gerencia.valor_total_entrada),
                        'valor_retorno': float(gerencia.valor_total_retorno),
                        'lucratividade': round(lucratividade, 2),
                        'qtd_entradas': gerencia.qtd_total_entrada
                    })
        else:
            dados = dados_agrupados
        
        # Análise de desempenho
        analise = {}
        if dados:
            total_entradas = sum(item['valor_entrada'] for item in dados)
            total_retornos = sum(item['valor_retorno'] for item in dados)
            
            if total_entradas > 0:
                lucro_total = total_retornos - total_entradas
                lucratividade_media = (lucro_total / total_entradas) * 100
                
                analise = {
                    'total_entradas': round(total_entradas, 2),
                    'total_retornos': round(total_retornos, 2),
                    'lucro_total': round(lucro_total, 2),
                    'lucratividade_media': round(lucratividade_media, 2),
                    'melhor_mes': max(dados, key=lambda x: x['lucratividade']) if dados else None,
                    'pior_mes': min(dados, key=lambda x: x['lucratividade']) if dados else None
                }
        
        return JsonResponse({
            'success': True,
            'dados': dados,
            'analise': analise
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
