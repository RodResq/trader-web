from django import forms
from django.core.validators import MinValueValidator
from decimal import Decimal

class AceitarApostaForm(forms.Form):
    evento_id = forms.IntegerField(
        widget=forms.HiddenInput(),
        required=True
    )
    
    mercado = forms.CharField(
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'readonly': 'readonly'
        }),
        required=True
    )
    
    odd = forms.DecimalField(
        max_digits=5,
        decimal_places=2,
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'readonly': 'readonly'
        }),
        required=True
    )
    
    valor_entrada = forms.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'step': '0.01',
            'min': '0.01'
        }),
        required=True,
        label='Valor da Entrada'
    )
    
    def clean_valor_entrada(self):
        valor = self.cleaned_data.get('valor_entrada')
        if valor <= 0:
            raise forms.ValidationError('O valor da entrada deve ser maior que zero.')
        return valor
    
    def clean(self):
        cleaned_data = super().clean()
        return cleaned_data