from django import forms
from django.forms import ModelForm
from .models import GerenciaCiclo
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

class GerenciaForm(forms.ModelForm):
    class Meta:
        model = GerenciaCiclo
        fields = ['qtd_total_entrada', 'valor_total_entrada', 'valor_total_retorno']
        widgets = {
            'qtd_total_entrada': forms.NumberInput(attrs={'class': 'form-control', 'min': '0'}),
            'valor_total_entrada': forms.NumberInput(attrs={'class': 'form-control', 'min': '0', 'step': '0.01'}),
            'valor_total_retorno': forms.NumberInput(attrs={'class': 'form-control', 'min': '0', 'step': '0.01'})
        }