from django.urls import path
from .views import IntegratedFashionRecommendAPIView

urlpatterns = [
    path(
        "generator/",
        IntegratedFashionRecommendAPIView.as_view(),
        name="fashion-recommend",
    )
]
