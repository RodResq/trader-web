from django import forms
from django.forms import ModelForm
from .models import Lucro
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

class LucroForm(forms.ModelForm):
    class Meta:
        model = Lucro
        fields = ['semana', 'quantidade_apostas', 'valor_inidividual_aposta', 'data_inicial', 'data_final']
        widgets = {
            'data_inicial': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'data_final': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'semana': forms.NumberInput(attrs={'class': 'form-control', 'min': '1'}),
            'quantidade_apostas': forms.NumberInput(attrs={'class': 'form-control', 'min': '0'}),
            'valor_inidividual_aposta': forms.NumberInput(attrs={'class': 'form-control', 'min': '0', 'step': '0.01'})
        }