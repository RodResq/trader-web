from django.urls import path
from .views import MonthPerformaceView

urlpatterns = [
    path('performace', MonthPerformaceView.as_view()),
]