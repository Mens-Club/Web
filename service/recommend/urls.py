from django.urls import path
from .views import IntegratedFashionRecommendAPIView

urlpatterns = [
    path('recommend/', IntegratedFashionRecommendAPIView.as_view(), name='fashion-recommend'),
]