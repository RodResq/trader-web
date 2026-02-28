from rest_framework.views import APIView
from rest_framework.response import Response
from analytics.models import Aposta
from django.utils import timezone
from django.db.models.functions import ExtractMonth, ExtractYear
from django.db.models import Sum

class MonthPerformaceView(APIView):
    def get(self, request):
        current_year = timezone.now().year
        
        retorno = (Aposta.objects
            .filter(data_aposta__year=current_year)
            .annotate(
                mes=ExtractMonth('data_aposta'),
                ano=ExtractYear('data_aposta'),
                )
            .values('mes', 'ano')
            .annotate(total_retorno=Sum('retorno'))
            .order_by('mes', 'ano')
        )
        return Response({"message": "GET - Hello World", "retorno": retorno})
