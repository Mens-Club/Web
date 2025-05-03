from django.urls import path
from .views import FashionRecommendationAPIView

urlpatterns = [
    path('similarity-search/', FashionRecommendationAPIView.as_view(), name='fashion-similarity-search'),
]