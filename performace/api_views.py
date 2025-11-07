from django.views import View
from django.http import JsonResponse
from django.db.models import Count, Case, When, FloatField
from django.db.models.functions import Cast
from analytics.models import Entrada
from django.db.models import Q

class PerformaceAPIView(View):
    
    def get(self, request):
        resultado = Entrada.objects.aggregate(
            total_registros=Count('id_event'),
            total_com_resultado=Count('entry_result'),
            total_green=Count(Case(When(entry_result='W', then=1))),
            percentual_green=Cast(
                Count(Case(When(entry_result='W', then=1))) * 100.0 /
                Count('id_event', filter=Q(entry_result__isnull=False)),
                FloatField()
            )
        )
        if resultado:
            return JsonResponse({
                'success': True,
                'total': resultado['total_registros'],
                'total_valido': resultado['total_com_resultado'],
                'percentual_green': f"{resultado['percentual_green']:.2f}"
            })