from django.urls import path
from .views import (
    RecommendPicked, MainPicked, MainRandomAPIView, MainByPriceAPIView, MainByStyleAPIView, 
    RecommendBookmarkByTimeAPIView, RecommendBookmarkByPriceAPIView, RecommendBookmarkByStyleAPIView, 
    MainRecommendBookmarkByTimeAPIView, MainRecommendBookmarkByPriceAPIView, MainRecommendBookmarkByStyleAPIView,
    RecommendationDetailView, MainRecommendationDetailView
)

urlpatterns = [
    path('recommend_picked/toggle/', RecommendPicked.as_view(), name='picked_view'),
    path('main_picked/toggle/', MainPicked.as_view(), name='main_picked_view'),
    path('main/random/', MainRandomAPIView.as_view(), name='main_random'),
    path('main/by-price/', MainByPriceAPIView.as_view(), name='main_by_price'),
    path('main/by-style/', MainByStyleAPIView.as_view(), name='main_by_style'),
    path('recommend_picked/by-time/', RecommendBookmarkByTimeAPIView.as_view(), name='picked_by_time'),
    path('recommend_picked/by-price/', RecommendBookmarkByPriceAPIView.as_view(), name='picked_by_price'),
    path('recommend_picked/by-style/', RecommendBookmarkByStyleAPIView.as_view(), name='picked_by_style'),
    path('main_picked/by-time/', MainRecommendBookmarkByTimeAPIView.as_view(), name='main_picked_by_time'),
    path('main_picked/by-price/', MainRecommendBookmarkByPriceAPIView.as_view(), name='main_picked_by_price'),
    path('main_picked/by-style/', MainRecommendBookmarkByStyleAPIView.as_view(), name='main_picked_by_style'),
    path('recommend_picked/<int:pk>/', RecommendationDetailView.as_view(), name='picked_detail'),
    path('main_picked/<int:pk>/', MainRecommendationDetailView.as_view(), name='main_picked_detail'),
]
