from django.urls import path
from .views import (
    LikeAddView, LikeDeleteView, MainLikeAddView, MainLikeDeleteView, MainRandomAPIView, MainByPriceAPIView, MainByStyleAPIView, 
    RecommendBookmarkByTimeAPIView, RecommendBookmarkByPriceAPIView, RecommendBookmarkByStyleAPIView, 
    MainRecommendBookmarkByTimeAPIView, MainRecommendBookmarkByPriceAPIView, MainRecommendBookmarkByStyleAPIView
)

urlpatterns = [
    path('like_add/', LikeAddView.as_view(), name='like_add_view'),
    path('like_delete/', LikeDeleteView.as_view(), name='like_delete_view'),
    path('main_like_add/', MainLikeAddView.as_view(), name='main_like_add_view'),
    path('main_like_delete/', MainLikeDeleteView.as_view(), name='main_like_delete_view'),
    path('main/random/', MainRandomAPIView.as_view(), name='main_random'),
    path('main/by-price/', MainByPriceAPIView.as_view(), name='main_by_price'),
    path('main/by-style/', MainByStyleAPIView.as_view(), name='main_by_style'),
    path('bookmark/by-time/', RecommendBookmarkByTimeAPIView.as_view(), name='bookmark_by_time'),
    path('bookmark/by-price/', RecommendBookmarkByPriceAPIView.as_view(), name='bookmark_by_price'),
    path('bookmark/by-style/', RecommendBookmarkByStyleAPIView.as_view(), name='bookmark_by_style'), # db에 style없어서 현재 수정 불가. migrations 해야함.
    path('main_picked/by-time/', MainRecommendBookmarkByTimeAPIView.as_view(), name='main_bookmark_by_time'),
    path('main_picked/by-price/', MainRecommendBookmarkByPriceAPIView.as_view(), name='main_bookmark_by_price'),
    path('main_picked/by-style/', MainRecommendBookmarkByStyleAPIView.as_view(), name='main_bookmark_by_style'),
]
