from django.views import View
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.http import require_http_methods
from django.db.models.functions import Abs
from django.db.models import F, Q
from datetime import timedelta

from analytics.models import Entrada


@require_http_methods(['GET'])
def proximo_evento(request):
    now = timezone.now()
    duas_horas_atras = now -timedelta(hours=2)
    
    jogo_ao_vivo = Entrada.objects.filter(
        data_jogo__isnull=False,
        data_jogo__lt=now,
        data_jogo__gte=duas_horas_atras
    ).annotate(
        diferenca_tempo=Abs(F('data_jogo') - now)
    ).order_by('diferenca_tempo').first()
    
    
    proximo_jogo_futuro = Entrada.objects.filter(
        data_jogo__isnull=False,
        data_jogo__gte=now  
    ).annotate(
        diferenca_tempo=Abs(F('data_jogo') - now)
    ).order_by('diferenca_tempo').first()
    
    if not proximo_jogo_futuro:
        return JsonResponse({
            'success': False,
            'message': 'Nenhum evento futuro encontrado'
        }, safe=False)
    
    def serializar_entrada(entrada):
        if not entrada:
            return None
        
        tempo_diff = entrada.data_jogo if entrada.data_jogo < now else entrada.data_jogo - now
        
        return {
            'id_event': entrada.id_event,
            'mercado': entrada.mercado,
            'odd': float(entrada.odd),
            'odd_change': entrada.get_odd_change_display(),
            'home_actual': entrada.home_actual,
            'away_actual': entrada.away_actual,
            'data_jogo': entrada.data_jogo.isoformat() if entrada.data_jogo else None,
            'opcao_entrada': entrada.get_opcao_entrada_display(),
            'resultado_estatistica': entrada.resultado_estatistica,
            'tempo_diferenca': {
                'total_seconds': int(tempo_diff.total_seconds()),
                'horas': tempo_diff.seconds // 3600,
                'minutos': (tempo_diff.seconds % 3600) // 60,
                'formatado': str(tempo_diff).split('.')[0]  # Remove microssegundos
            }
        }
        
    response_data = {
        'success': True,
        'timestamp': now.isoformat(),
        'jogo_ao_vivo': serializar_entrada(jogo_ao_vivo),
        'proximo_jogo_futuro': serializar_entrada(proximo_jogo_futuro),
        'status': {
            'tem_jogo_ao_vivo': jogo_ao_vivo is not None,
            'tem_proximo_jogo': proximo_jogo_futuro is not None
        }
    }
    
    return JsonResponse(response_data, safe=False)
        
        