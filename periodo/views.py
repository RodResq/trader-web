from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.contrib import messages
from .models import Periodo
from .forms import PeriodoForm

def periodos(request):
    """Exibe a lista de períodos cadastrados."""
    periodos = Periodo.objects.all()
    return render(request, 'analytics/periodo/periodos.html', {'periodos': periodos})

def periodo_edit(request, pk=None):
    """Edita um período existente ou cria um novo."""
    if pk:
        periodo = get_object_or_404(Periodo, pk=pk)
    else:
        periodo = None
        
    if request.method == 'POST':
        form = PeriodoForm(request.POST, instance=periodo)
        if form.is_valid():
                form.save()
                messages.success(request, 'Período salvo com sucesso!')
                return redirect('periodo:index')
    else:
        form = PeriodoForm(instance=periodo)
        
    context = {
        'form': form,
        'periodo': periodo,
        'titulo': 'Editar Período' if periodo else 'Novo Período'
    }
    
    return render(request, 'analytics/periodo/periodo_form.html', context)

def periodo_delete(request, pk):
    """Exclui um período."""
    periodo = get_object_or_404(Periodo, pk=pk)
    
    if request.method == 'POST':
        periodo.delete()
        messages.success(request, 'Período excluído com sucesso!')
        return redirect('periodo:index')
    
    return render(request, 'analytics/periodo/periodo_confirm_delete.html', {'periodo': periodo})
