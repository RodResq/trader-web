from django.urls import path
from prediction.views import PredictionView

urlpatterns = [
    path('', PredictionView.as_view())
]