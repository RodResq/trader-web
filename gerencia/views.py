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
from decimal import Decimal
from datetime import datetime

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


def grafico_performace_semanal(request):
    try:
        ciclos_gerenciados = GerenciaCiclo.objects.select_related('ciclo').all().order_by('ciclo__data_inicial')
        
        dados = []
        
        for gerencia in ciclos_gerenciados:
            data_inicial = gerencia.ciclo.data_inicial.strftime('%d/%m/%Y')
            data_final = gerencia.ciclo.data_final.strftime('%d/%m/%Y')
            valor_total_retorno = gerencia.valor_total_retorno or Decimal('0.00')
                
            
            dados.append({
                'periodo': f"{data_inicial} a {data_final}",
                'valor_retorno': float(valor_total_retorno),
            })
        
        # dados = sorted(dados, key=lambda x: datetime.strptime(x['data_inicial'], '%d/%m/%Y'))
            
        return JsonResponse({
                'success': True,
                'dados': dados
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)