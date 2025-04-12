
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.contrib import messages
from .models import Lucro
from .forms import LucroForm

def lucro_list(request):
    """Exibe a lista de registros de lucro."""
    # lucros = Lucro.objects.all()
    return render(request, 'lucro/lucro_list.html')

def lucro_edit(request, pk=None):
    """Edita um registro de lucro existente ou cria um novo."""
    if pk:
        lucro = get_object_or_404(Lucro, pk=pk)
    else:
        lucro = None

    if request.method == 'POST':
        form = LucroForm(request.POST, instance=lucro)
        if form.is_valid():
            form.save()
            messages.success(request, 'Registro de lucro salvo com sucesso!')
            return redirect('lucro:lucro_list')
    else:
        form = LucroForm(instance=lucro)

    context = {
        'form': form,
        'lucro': lucro,
        'titulo': 'Editar Lucro' if lucro else 'Novo Registro de Lucro'
    }
    return render(request, 'lucro/lucro_form.html', context)

def lucro_delete(request, pk):
    """Exclui um registro de lucro."""
    lucro = get_object_or_404(Lucro, pk=pk)
    
    if request.method == 'POST':
        lucro.delete()
        messages.success(request, 'Registro de lucro excluído com sucesso!')
        return redirect('lucro:lucro_list')
        
    return render(request, 'lucro/lucro_confirm_delete.html', {'lucro': lucro})