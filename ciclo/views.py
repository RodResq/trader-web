from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.contrib import messages
from django.db import transaction, IntegrityError
from django.http import JsonResponse

from ciclo.models import Ciclo 
from ciclo.forms import CicloEntradaForm
from gerencia.models import GerenciaCiclo, EvolucaoSaldoAtual
from owner_ball.models import CycleOwnerBall

from datetime import date, timedelta

def ciclos(request):
    """Exibe a lista de ciclos cadastrados."""
    ciclos = Ciclo.objects.all()
    cycle_owner_ball = CycleOwnerBall.objects.all()
    return render(request, 'analytics/ciclo/ciclos.html', 
                  {
                    'ciclos': ciclos, 
                    'cycle_owner_ball': cycle_owner_ball
                   })

def ciclo_edit(request, pk=None):
    """Edita um ciclo existente ou cria um novo."""
    ciclo = get_object_or_404(Ciclo, pk=pk) if pk else None
    is_edit = ciclo is not None
        
    if request.method == 'POST':
        form = CicloEntradaForm(request.POST, instance=ciclo)
        
        if form.is_valid():
            try:
                with transaction.atomic():
                    ciclo = form.save()
                    
                    evolucao_saldo_atual = EvolucaoSaldoAtual()
                    evolucao_saldo_atual.id_ciclo = ciclo
                    evolucao_saldo_atual.saldo = ciclo.saldo_atual
                    evolucao_saldo_atual.disponivel_entrada = ciclo.valor_disponivel_entrada
                    evolucao_saldo_atual.save()
                
                if not is_edit:
                    gerencia_ciclo = GerenciaCiclo(ciclo=ciclo, 
                                qtd_total_entrada=0, 
                                valor_total_entrada=0, 
                                valor_total_retorno=0)
                    gerencia_ciclo.save()
                
                messages.success(request, 'Ciclo salvo com sucesso!')
                return redirect('ciclo:index')
            except IntegrityError as e:
                messages.error(
                    request, 
                    'Não é possivel editar mais de uma vez o saldo no mesmo dia.' 
                    'Contate o Administrador')
            except Exception as e:
                messages.error(
                    request,
                    f'Erro inesperado ao salvar o ciclo: {str(e)}. '
                    'Contate o Administrador'
                )
        else:
           messages.error(
                request, 
                'Por favor, corrija os erros abaixo antes de continuar.'
            ) 
    else:
        form = CicloEntradaForm(instance=ciclo)
        
    context = {
        'form': form,
        'ciclo': ciclo,
        'titulo': 'Editar Período' if ciclo else 'Novo Ciclo'
    }
    
    return render(request, 'analytics/ciclo/ciclo_form.html', context)

def ciclo_delete(request, pk):
    """Exclui um período."""
    ciclo = get_object_or_404(Ciclo, pk=pk)
    
    if request.method == 'POST':
        ciclo.delete()
        messages.success(request, 'Ciclo excluído com sucesso!')
        return redirect('ciclo:index')
    
    return render(request, 'analytics/ciclo/ciclo_confirm_delete.html', {'ciclo': ciclo})


def evolucao_saldo_json(request, ciclo_id):
    """
    API endpoint para retornar dados de evolução do saldo de um ciclo específico
    """
    try:
        ciclo = get_object_or_404(Ciclo, pk=ciclo_id)
        evolucoes = EvolucaoSaldoAtual.objects.filter(id_ciclo=ciclo).order_by('data')
        dados = []
        
        for evolucao in evolucoes:
            dados.append({
                'data': evolucao.data.strftime('%d/%m/%Y'),
                'saldo': float(evolucao.saldo),
                'disponivel_entrada': float(evolucao.disponivel_entrada),
                'data_iso': evolucao.data.isoformat()
            })
            
        analise = {}
        if dados:
            saldo_inicial = dados[0]['saldo'] if dados else 0
            saldo_final = dados[-1]['saldo'] if dados else 0  # Corrigido: usar último item
            variacao_total = saldo_final - saldo_inicial
            variacao_percentual = 0
            
            if saldo_inicial > 0:
                variacao_percentual = (variacao_total / saldo_inicial) * 100
                
            maior_saldo = max(dados, key=lambda x: x['saldo']) if dados else None
            menor_saldo = min(dados, key=lambda x: x['saldo']) if dados else None
            
            maior_disponivel = max(dados, key=lambda x: x['disponivel_entrada']) if dados else None
            menor_disponivel = min(dados, key=lambda x: x['disponivel_entrada']) if dados else None
            
            analise = {
                'saldo_inicial': round(saldo_inicial, 2),
                'saldo_final': round(saldo_final, 2),
                'variacao_total': round(variacao_total, 2),
                'variacao_percentual': round(variacao_percentual, 2),
                'maior_saldo': {
                    'valor': round(maior_saldo['saldo'], 2),
                    'data': maior_saldo['data']
                } if maior_saldo else None,
                'menor_saldo': {
                    'valor': round(menor_saldo['saldo'], 2),
                    'data': menor_saldo['data']
                } if menor_saldo else None,
                'maior_disponivel': {
                    'valor': round(maior_disponivel['disponivel_entrada'], 2),
                    'data': maior_disponivel['data']
                } if maior_disponivel else None,
                'menor_disponivel': {
                    'valor': round(menor_disponivel['disponivel_entrada'], 2),
                    'data': menor_disponivel['data']
                } if menor_disponivel else None,
                'total_registros': len(dados)
            } 
            
        return JsonResponse({
            'success': True,
            'ciclo': {
                'id': ciclo.id,
                'categoria': ciclo.get_categoria_display(),
                'data_inicial': ciclo.data_inicial.strftime('%d/%m/%Y'),
                'data_final': ciclo.data_final.strftime('%d/%m/%Y'),
                'saldo_atual': float(ciclo.saldo_atual),
                'valor_disponivel_entrada': float(ciclo.valor_disponivel_entrada)
            },
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
