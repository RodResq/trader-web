from django import forms
from django.forms import ModelForm
from .models import Resultado
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

class LucroForm(forms.ModelForm):
    class Meta:
        model = Resultado
        fields = ['semana', 'quantidade_apostas', 'total_entradas', 'total_retorno', 'data_inicial', 'data_final']
        widgets = {
            'data_inicial': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'data_final': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'semana': forms.NumberInput(attrs={'class': 'form-control', 'min': '1'}),
            'quantidade_apostas': forms.NumberInput(attrs={'class': 'form-control', 'min': '0'}),
            'total_entradas': forms.NumberInput(attrs={'class': 'form-control', 'min': '0', 'step': '0.01'}),
            'total_retorno': forms.NumberInput(attrs={'class': 'form-control', 'min': '0', 'step': '0.01'})
        }