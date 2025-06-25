from django.shortcuts import render
from django.http import request
from analytics.models import Aposta
from datetime import datetime
from django.db.models.functions import TruncDate
from django.db.models import Count, Sum
from django.http import JsonResponse
from collections import defaultdict
import locale



def grafico_melhor_dia(request):
    try:
        greens = Aposta.objects.filter(
            resultado='G'
        ).annotate(
            data_apenas=TruncDate('data_aposta')
        ).values(
            'data_apenas'
        ).annotate(
            total_apostas=Count('id'),
            retorno_total=Sum('retorno')
        ).order_by('data_apenas')
        
        dias_semana = [
            'Segunda-feira', 'Terça-feira', 'Quarta-feira', 
            'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'
        ]
        
        agrupado = defaultdict(lambda: {'total_retorno': 0, 'total_apostas': 0})
        dados = []
        for green in greens:
            data_obj = green['data_apenas']
            dia_semana = dias_semana[data_obj.weekday()]
            
            agrupado[dia_semana]['total_retorno'] += float(green['retorno_total']) if green['retorno_total'] else 0
            agrupado[dia_semana]['total_apostas'] += green['total_apostas']
        
            
        dados = []
        for dia in dias_semana:
            if dia in agrupado:
                dados.append({
                    'dia_aposta': dia,
                    'total_retorno': agrupado[dia]['total_retorno'],
                    'total_apostas': agrupado[dia]['total_apostas']
                })
        
        return JsonResponse({
            'success': True,
            'dados': dados
        }, status=200)
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
    
