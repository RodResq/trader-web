from django import forms
from django.forms import ModelForm 
from .models import Periodo
from django.core.exceptions import ValidationError


class PeriodoForm(forms.ModelForm):
    class Meta:
        model = Periodo
        fields = ['categoria', 'saldo_atual', 'disponivel_entrada', 'data_inicial', 'data_final']
        widgets = {
            'categoria': forms.Select(attrs={'class': 'form-control'}),
            'saldo_atual': forms.NumberInput(attrs={'class': 'form-control', 'min': '0', 'step': '0.01'}),
            'disponivel_entrada': forms.NumberInput(attrs={'class': 'form-control', 'min': '0', 'step': '0.01'}),
            'data_inicial': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'data_final': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'})
        }
        
    def clean(self):
        cleaned_data = super().clean()
        data_inicial = cleaned_data.get('data_inicial')
        data_final = cleaned_data.get('data_final')
        
        if data_inicial and data_final and data_final < data_inicial:
            raise ValidationError(_('A data final deve ser posterior à data inicial.'))
        
    def clean_saldo_atual(self):
        saldo_atual = self.cleaned_data.get('saldo_atual')
        
        if saldo_atual and saldo_atual < 0:
            raise ValidationError(_('O saldo atual não pode ser negativo.'))
        
        return saldo_atual
    
    def clean_disponivel_entrada(self):
        disponivel_entrada = self.cleaned_data.get('disponivel_entrada')
        
        if disponivel_entrada and disponivel_entrada < 0:
            raise ValidationError(_('O valor disponível para entrada não pode ser negativo.'))
        
        return disponivel_entrada
            
            