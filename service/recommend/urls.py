from django.urls import path
from .views import IntegratedFashionRecommendAPIView

urlpatterns = [
    path(
        "generator/",
        IntegratedFashionRecommendAPIView.as_view(),
        name="fashion-recommend",
    ),
    # path(
    #     "get_recommendations/",
    #     RecommendationDetailAPIView().as_view(),
    #     name="get_recommend"
    # )
]
