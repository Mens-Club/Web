from django.urls import path
from .views import LikeView, MainLikeView

urlpatterns = [
    path('like/', LikeView.as_view(), name='like_recommendation'),
    path('main_like/', MainLikeView.as_view(), name='main_like_recommendation'),
]
