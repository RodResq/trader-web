from django import forms
from django.forms import ModelForm 

from .models import Ciclo
from django.core.exceptions import ValidationError

from decimal import Decimal
from datetime import timedelta


class CicloEntradaForm(forms.ModelForm):
    class Meta:
        model = Ciclo
        fields = ['categoria', 'saldo_atual', 'valor_disponivel_entrada', 'data_inicial', 'data_final']
        widgets = {
            'categoria': forms.Select(attrs={'class': 'form-control'}),
            'saldo_atual': forms.NumberInput(attrs={'class': 'form-control', 'min': '0', 'step': '0.01'}),
            'valor_disponivel_entrada': forms.NumberInput(attrs={'class': 'form-control', 'min': '0', 'step': '0.01'}),
            'data_inicial': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'data_final': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'})
        }
        
    def clean(self):
        cleaned_data = super().clean()
        data_inicial = cleaned_data.get('data_inicial')
        data_final = cleaned_data.get('data_final')
        saldo_atual = cleaned_data.get('saldo_atual')
        categoria = cleaned_data.get('categoria')
        
        if data_inicial and data_final:
            existe_ciclo = Ciclo.objects.filter(data_inicial__lte=data_inicial, data_final__gte=data_final).exists()
            
            if existe_ciclo:
                raise ValidationError('Ciclo com data inicial e final já existe!') 
            
            if data_final < data_inicial:
                raise ValidationError('A data final deve ser posterior à data inicial.')
        
            duracao = (data_final - data_inicial) + timedelta(days=1)
            
            if categoria == 'S' and duracao.days != 7:
                raise ValidationError('Para ciclos semanais, o período deve ser exatamente de 7 dias.')
            elif categoria == 'Q' and duracao != 15:
                raise ValidationError('Para ciclos quinzenais, o período deve ser exatamente de 15 dias.')
            elif categoria == 'M' and (duracao != 30 or duracao != 31):
                raise ValidationError('Para ciclos mensais, o período deve ser exatamente de 30 ou 31 dias.')
            
        if saldo_atual:
            cleaned_data['valor_disponivel_entrada'] = round(saldo_atual * Decimal('0.06'), 2)
     
        return cleaned_data
        
    def clean_saldo_atual(self):
        saldo_atual = self.cleaned_data.get('saldo_atual')
        
        if saldo_atual <= 0.0:
            raise ValidationError('O saldo atual não pode ser menor ou igual a 0.')
        
        return saldo_atual
    
    def clean_valor_disponivel_entrada(self):
        valor_disponivel_entrada = self.cleaned_data.get('valor_disponivel_entrada')
        saldo_atual = self.cleaned_data.get('saldo_atual')
        
        if valor_disponivel_entrada and valor_disponivel_entrada < 0:
            raise ValidationError('O valor disponível para entrada não pode ser negativo.')
        
        # Se o saldo_atual existe, garante que o valor_disponivel_entrada seja exatamente 6%
        if saldo_atual:
            return round(saldo_atual * Decimal('0.06'), 2)
        
        return valor_disponivel_entrada
            
            