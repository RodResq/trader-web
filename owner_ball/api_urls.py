from django.urls import path

from owner_ball.views import (
    listar_owner_ball_super_favorito,
    listar_owner_ball_favorito_home,
    listar_owner_ball_under_2_5,
    resultado_entrada,
    CycleOwnerBallView
)

urlpatterns = [
    path('super_favorito', listar_owner_ball_super_favorito, name='listar_owner_ball_super_favorito'),
    path('favorito_home', listar_owner_ball_favorito_home, name='listar_owner_ball_favorito_home'),
    path('under_2_5', listar_owner_ball_under_2_5, name='listar_owner_ball_under_2_5'),
    path('resultado_entrada', resultado_entrada, name='resultado_entrada'),
    path('cycle', CycleOwnerBallView.as_view(), name='cycle-create')
]
