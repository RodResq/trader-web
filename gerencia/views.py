from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.contrib import messages
from analytics.models import Entrada, Aposta
from django.db.models import Q, Sum
from django.http import JsonResponse
from django.db import transaction
from .models import GerenciaCiclo
from .forms import GerenciaForm

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