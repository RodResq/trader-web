from django.shortcuts import render

from rest_framework import generics
from rest_framework import permissions

# Create your views here.
class Tournaments(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pass
