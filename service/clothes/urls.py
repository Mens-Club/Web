from django.urls import path
from .views import RecommendedGoodsView, SaveImageAPIView

urlpatterns = [
    path('random-clothing/', RecommendedGoodsView.as_view(), name='random_clothing'),
    path('save_image/', SaveImageAPIView.as_view(), name='save_image'),
]