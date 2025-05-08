from django.urls import path
from .views import IntegratedFashionRecommendAPIView

urlpatterns = [
    path('recommed/', IntegratedFashionRecommendAPIView.as_view(), name='fashion-recommend'),
]