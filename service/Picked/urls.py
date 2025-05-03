from rest_framework.routers import DefaultRouter
from .views import RecommendationTestViewSet

router = DefaultRouter()
router.register(r'recommendations', RecommendationTestViewSet, basename='recommendation')

urlpatterns = router.urls