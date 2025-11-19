from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from evento.api_views import proximo_evento
from performace.api_views import PerformaceAPIView
from analytics.views import (
    evento, 
    apostar, 
    mercados, 
    entrada_multipla, 
    atualizar_odd_change, 
    atualizar_odd_status, 
    atualizar_statistica_overall,
    atualizar_statistica_overall_team,
    comparar_statistica_teams) 
from grafico.views import (
    performace_semanal,
    resultado_aposta,
    melhor_dia_semana
)
from gerencia.views import gerencia_resultado
from rest_framework.authtoken import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from auth.views import CustomTokenObteinPairView

web_urlpatterns = [
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('__debug__/', include('debug_toolbar.urls')),
    path('dashboard', include('analytics.urls')),
    path('resultado/<int:id_evento>', evento, name='evento'),
    path('gerencia/', include('gerencia.urls', namespace='gerencia')),
    path('ciclos/', include('ciclo.urls', namespace='ciclo')),
    path('evento/', include('evento.urls')),
    path('performace/', include('performace.urls')),
    path('team', include('team.urls'), name='team'),
]

api_urlpatterns = [
    path('api/v1/analytics/', include('analytics.api_urls')),
    path('api/v1/entradas/', include('entrada.api_urls')),
    path('api/v1/markets', mercados, name='mercados'),
    path('api/v1/markets_test/', include('market.api_urls')),
    path('api/v1/entrada_multipla', entrada_multipla, name="entrada_multipla"),
    path('api/v1/apostar', apostar, name='apostar'),
    path('api/v1/update_odd', atualizar_odd_status, name='atualizar_odd_status'),
    path('api/v1/odd_change/<int:id_evento>', atualizar_odd_change, name='atualizar_odd_change'),
    path('api/v1/proximo_evento', proximo_evento, name='proximo_evento'),
    path('api/v1/statistic/<int:id_evento>', atualizar_statistica_overall, name='atualizar_statistica_overall'),
    path('api/v1/statistic/team/<int:id_team>', atualizar_statistica_overall_team, name='atualizar_statistica_overall_team'),
    path('api/v1/statistic/compare/<int:id_home>/<int:id_away>', comparar_statistica_teams, name='comparar_statistica_teams'),
    path('api/v1/grafico/performace_semanal', performace_semanal, name="performace_semanal"),
    path('api/v1/grafico/resultado_aposta', resultado_aposta, name="resultado_aposta"),
    path('api/v1/grafico/melhor_dia_semana', melhor_dia_semana, name="melhor_dia_semana"),
    path('api/v1/performace', PerformaceAPIView.as_view()),
    path('api/v1/gerencia/resultado', gerencia_resultado, name="gerencia_resultado"),
    path('api/v1/team/', include('team.api_urls')),
    path('api/v1/unique_tournament/', include('unique_tournament.api_urls')),
    path('api/v1/owner_ball/', include('owner_ball.api_urls')),
    path('api/v1/events/', include('evento.api_urls')),
]

admin_urlpatterns = [
    path('admin/', admin.site.urls),
] 

token_urlpatterns = [
    # Token basico DRF
    path('api-token-auth/', views.obtain_auth_token),
    
    # JWT com gerenciamento de sessao
    path('api/token/', CustomTokenObteinPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
]

urlpatterns = admin_urlpatterns + web_urlpatterns + api_urlpatterns + token_urlpatterns

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    