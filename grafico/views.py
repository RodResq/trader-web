from django.http import JsonResponse
from django.db.models.functions import TruncDate
from django.db.models import Count, Sum
from collections import defaultdict
from gerencia.models import GerenciaCiclo
from analytics.models import Aposta
from decimal import Decimal


def performace_semanal(request):
    try:
        ciclos_gerenciados = GerenciaCiclo.objects.select_related('ciclo').all().order_by('ciclo__data_inicial')
        dados = []
        
        for gerencia in ciclos_gerenciados:
            data_inicial = gerencia.ciclo.data_inicial.strftime('%d/%m/%Y')
            data_final = gerencia.ciclo.data_final.strftime('%d/%m/%Y')
            valor_total_retorno = gerencia.valor_total_retorno or Decimal('0.00')
            
            dados.append({
                'periodo': f"{data_inicial} a {data_final}",
                'valor_retorno': float(valor_total_retorno),
            })
        return JsonResponse({
                'success': True,
                'dados': dados
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

        
def resultado_aposta(request):
    try:
        dados = []
        resultado_contagem = Aposta.objects.values('resultado').annotate(total=Count('resultado')).order_by('resultado')
        
        RESULTADO_DICT = dict(Aposta.RESULTADO_CHOICES)
        
        for item in resultado_contagem:
            codigo = item['resultado']
            nome = RESULTADO_DICT.get(codigo, 'Não definido')
            dados.append({
                'resultado': nome,
                'total': item['total']
            })
        
        return JsonResponse({
            'success': True,
            'dados': dados
        }, status=200)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
        

def melhor_dia_semana(request):
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
        