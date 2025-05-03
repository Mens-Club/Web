from django.urls import path
from .views import PickView
from rest_framework.routers import DefaultRouter
from .views import RecommendationTestViewSet

urlpatterns = [
    path('pick/', PickView.as_view(), name='pick'),
]

router = DefaultRouter()
router.register(r'recommendations', RecommendationTestViewSet, basename='recommendation')

urlpatterns = router.urls
