from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.contrib import messages
from .models import GerenciaCiclo
from .forms import GerenciaForm
from analytics.models import Entrada
from django.db.models import Q, Sum

def gerencia(request):
    """Exibe a lista de registros de lucro."""
    gerencias = GerenciaCiclo.objects.all()
    
    resultado_entradas = []
    
    for gerencia in gerencias:
        entradas = Entrada.objects.filter(ciclo=gerencia.ciclo
        ).filter(opcao_entrada="A")
        
        qtd_total_entradas = entradas.count()
        valor_total_entradas = entradas.aggregate(
            total_valor=Sum('valor', default=0)
        )['total_valor']
        
        if qtd_total_entradas > 0:
            if valor_total_entradas != gerencia.valor_total_entrada:
                gerencia.valor_total_entrada = valor_total_entradas
                gerencia.qtd_total_entrada = qtd_total_entradas
                gerencia.save()
        
        resultado_dict = {
            'gerencia': gerencia,
            'entradas': entradas
        }
        
        resultado_entradas.append(resultado_dict)
    
    return render(request, 'analytics/gerencia/gerencia.html', {'resultado_entradas': resultado_entradas})

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
