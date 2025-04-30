from django.urls import path
from .views import RecommendedGoodsView, SaveImageAPIView, UserLikeSetView, CancelLikeAPIView

urlpatterns = [
    path('random-clothing/', RecommendedGoodsView.as_view(), name='random_clothing'),
    path('save_image/', SaveImageAPIView.as_view(), name='save_image'),
    path('user_like_list', UserLikeSetView.as_view(), name='user_like_list'),
    path('cancel_like/', CancelLikeAPIView.as_view(), name='cancel_like'),
]