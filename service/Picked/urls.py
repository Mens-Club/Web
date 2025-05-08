from django.urls import path
from .views import PickView, RecommendationTestViewSet

recommendation = RecommendationTestViewSet.as_view

urlpatterns = [
    path('pick/', PickView.as_view(), name='pick'),

    # 커스텀 액션들
    path('picked/recommendations/newest/', recommendation({'get': 'newest'}), name='picked_recommendations_newest'),
    path('picked/recommendations/oldest/', recommendation({'get': 'oldest'}), name='picked_recommendations_oldest'),
    path('picked/recommendations/price/', recommendation({'get': 'price'}), name='picked_recommendations_price'),
    path('picked/recommendations/random/', recommendation({'get': 'random'}), name='picked_recommendations_random'),
    path('picked/recommendations/style/', recommendation({'get': 'style'}), name='picked_recommendations_style'),
]
