from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.contrib import messages
from .models import Ciclo
from .forms import CicloEntradaForm

def ciclos(request):
    """Exibe a lista de ciclos cadastrados."""
    ciclos = Ciclo.objects.all()
    return render(request, 'analytics/ciclo/ciclos.html', {'ciclos': ciclos})

def ciclo_edit(request, pk=None):
    """Edita um ciclo existente ou cria um novo."""
    if pk:
        ciclo = get_object_or_404(Ciclo, pk=pk)
    else:
        ciclo = None
        
    if request.method == 'POST':
        form = CicloEntradaForm(request.POST, instance=ciclo)
        if form.is_valid():
                form.save()
                messages.success(request, 'Ciclo salvo com sucesso!')
                return redirect('ciclo:index')
    else:
        form = CicloEntradaForm(instance=ciclo)
        
    context = {
        'form': form,
        'ciclo': ciclo,
        'titulo': 'Editar Período' if ciclo else 'Novo Período'
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
