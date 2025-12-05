from django.shortcuts import render

from rest_framework import generics
from rest_framework import permissions



def tournaments_render(request):
    return render(request, 'analytics/tournament/index.html')

# Create your views here.
class Tournaments(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get(self, request):
        pass
