from django.urls import path

from market.views import SuperFavoriteHomeScore

urlpatterns = [
    path('home/super_favorite_scrore', SuperFavoriteHomeScore.as_view(), name='super_favorite_score_home'),
]