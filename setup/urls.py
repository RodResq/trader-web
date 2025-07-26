from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from evento.api_views import proximo_evento
from performace.api_views import PerformaceAPIView
from analytics.views import (
    index,
    aceitar_aposta, 
    evento, 
    apostar, 
    mercados, 
    editar_odd, 
    entrada_multipla, 
    atualizar_odd_change, 
    atualizar_odd_status, 
    atualizar_statistica_overall) 
from owner_ball.views import (
    listar_owner_ball_super_favorito,
    listar_owner_ball_favorito_home,
    listar_owner_ball_under_2_5)
from grafico.views import (
    performace_semanal,
    resultado_aposta,
    melhor_dia_semana
)
from gerencia.views import gerencia_resultado

web_urlpatterns = [
    path('__debug__/', include('debug_toolbar.urls')),
    path('analytics', include('analytics.urls')),
    path('resultado/<int:id_evento>', evento, name='evento'),
    path('gerencia/', include('gerencia.urls', namespace='gerencia')),
    path('ciclos/', include('ciclo.urls', namespace='ciclo')),
    path('evento/', include('evento.urls')),
    path('ciclos/', include('ciclo.urls')),
    path('performace/', include('performace.urls')),
    path('team/', include('team.urls'), name='team'),
]

api_urlpatterns = [
    path('api/analytics/', include('analytics.api_urls')),
    path('api/mercados', mercados, name='mercados'),
    path('api/entrada_multipla', entrada_multipla, name="entrada_multipla"),
    path('api/apostar', apostar, name='apostar'),
    path('api/update_odd', atualizar_odd_status, name='atualizar_odd_status'),
    path('api/odd_change/<int:id_evento>', atualizar_odd_change, name='atualizar_odd_change'),
    path('api/proximo_evento', proximo_evento, name='proximo_evento'),
    path('api/atualizar-statistic-overall/<int:id_evento>', atualizar_statistica_overall, name='atualizar_statistica_overall'),
    path('api/owner_ball/super_favorito', listar_owner_ball_super_favorito, name='listar_owner_ball_super_favorito'),
    path('api/owner_ball/favorito_home', listar_owner_ball_favorito_home, name='listar_owner_ball_favorito_home'),
    path('api/owner_ball/under_2_5', listar_owner_ball_under_2_5, name='listar_owner_ball_under_2_5'),
    path('api/grafico/performace_semanal', performace_semanal, name="performace_semanal"),
    path('api/grafico/resultado_aposta', resultado_aposta, name="resultado_aposta"),
    path('api/grafico/melhor_dia_semana', melhor_dia_semana, name="melhor_dia_semana"),
    path('api/performace', PerformaceAPIView.as_view()),
    path('api/gerencia/resultado', gerencia_resultado, name="gerencia_resultado"),
]

admin_urlpatterns = [
    path('admin/', admin.site.urls),
] 

urlpatterns = admin_urlpatterns + web_urlpatterns + api_urlpatterns

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    