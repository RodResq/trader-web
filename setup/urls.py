"""
URL configuration for setup project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from analytics.views import index, evento, apostar, mercados, editar_odd, entrada_multipla

urlpatterns = [
    path('admin/', admin.site.urls),
    path('__debug__/', include('debug_toolbar.urls')),
    path('', index, name='index'),
    path('resultado/<int:id_evento>', evento, name='evento'),
    path('analytics/', include('analytics.urls')),
    path('api/apostar', apostar, name='apostar'),
    path('api/mercados', mercados, name='mercados'),
    path('api/editar_odd', editar_odd, name="editar_odd"),
    path('api/entrada_multipla', entrada_multipla, name="entrada_multipla"),
    path('ciclos/', include('ciclo.urls', namespace='ciclo'))
]
