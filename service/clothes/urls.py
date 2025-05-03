from django.urls import path
from .views import OutfitRecommendView


urlpatterns = [
    path("recommend/outfit/", OutfitRecommendView.as_view(), name="Recommend"),
]
