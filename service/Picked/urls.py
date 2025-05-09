from django.urls import path
from .views import LikeView, MainLikeView, LikeCancelView, MainLikeCancelView

urlpatterns = [
    path('like/', LikeView.as_view(), name='like_recommendation'),
    path('main_like/', MainLikeView.as_view(), name='main_like_recommendation'),
    path('like_cancel/', LikeCancelView.as_view(), name='like_cancel'),
    path('main_like_cancel/', MainLikeCancelView.as_view(), name='main_like_cancel'),
]
