from django.urls import path
from .views import IntegratedFashionRecommendAPIView

urlpatterns = [
    path(
        "recommned/",
        IntegratedFashionRecommendAPIView.as_view(),
        name="fashion-recommend",
    ),
]
