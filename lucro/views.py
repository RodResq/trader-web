from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.contrib import messages
from .models import Resultado
from .forms import LucroForm

def lucros(request):
    """Exibe a lista de registros de lucro."""
    lucros = Resultado.objects.all()
    return render(request, 'analytics/lucro/lucros.html', {'lucros': lucros})

def lucro_edit(request, pk=None):
    """Edita um registro de lucro existente ou cria um novo."""
    if pk:
        lucro = get_object_or_404(Resultado, pk=pk)
    else:
        lucro = None

    if request.method == 'POST':
        form = LucroForm(request.POST, instance=lucro)
        if form.is_valid():
            form.save()
            messages.success(request, 'Registro de lucro salvo com sucesso!')
            return redirect('analytics:lucro:index')
    else:
        form = LucroForm(instance=lucro)

    context = {
        'form': form,
        'lucro': lucro,
        'titulo': 'Editar Lucro' if lucro else 'Novo Registro de Lucro'
    }
    return render(request, 'analytics/lucro/lucro_form.html', context)

def lucro_delete(request, pk):
    """Exclui um registro de lucro."""
    lucro = get_object_or_404(Resultado, pk=pk)
    
    if request.method == 'POST':
        lucro.delete()
        messages.success(request, 'Registro de lucro excluído com sucesso!')
        return redirect('analytics:lucro:index')
        
    return render(request, 'analytics/lucro/lucro_confirm_delete.html', {'lucro': lucro})