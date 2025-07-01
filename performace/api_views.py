from django.views import View
from django.http import JsonResponse
from django.db.models import Count, Case, When, FloatField
from django.db.models.functions import Cast
from analytics.models import Aposta

class PerformaceAPIView(View):
    
    def get(self, request):
        resultado = Aposta.objects.aggregate(
            total_registros=Count('id'),
            total_green=Count(Case(When(resultado='G', then=1))),
            percentual_green=Cast(
                Count(Case(When(resultado='G', then=1))) * 100.0 / Count('id'),
                FloatField()
            )
        )
        if resultado:
            return JsonResponse({
                'success': True,
                'total': resultado['total_registros'],
                'percentual_green': f"{resultado['percentual_green']:.2f}"
            })