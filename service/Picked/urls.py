from django.urls import path
from .views import LikeView, MainLikeView, LikeCancelView, MainLikeCancelView
from .views import MainRandomAPIView, MainByPriceAPIView, MainByStyleAPIView, PickedByTimeAPIView, PickedByPriceAPIView,PickedByStyleAPIView

urlpatterns = [
    path('like/', LikeView.as_view(), name='like_recommendation'),
    path('main_like/', MainLikeView.as_view(), name='main_like_recommendation'),
    path('like_cancel/', LikeCancelView.as_view(), name='like_cancel'),
    path('main_like_cancel/', MainLikeCancelView.as_view(), name='main_like_cancel'),
    path('main/random/', MainRandomAPIView.as_view(), name='main-random'),
    path('main/by-price/', MainByPriceAPIView.as_view(), name='main-by-price'),
    path('main/by-style/', MainByStyleAPIView.as_view(), name='main-by-style'),
    path('picked/by-time/', PickedByTimeAPIView.as_view(), name='picked-by-time'),
    path('picked/by-price/', PickedByPriceAPIView.as_view(), name='picked-by-price'),
    path('picked/by-style/', PickedByStyleAPIView.as_view(), name='picked-by-style'),
]
