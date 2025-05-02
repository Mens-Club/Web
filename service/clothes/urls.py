from django.urls import path, include
from rest_framework.routers import DefaultRouter

# from .views import RecommendedViewSet, PickedViewSet

# from .views import PickedClothesMainView, PickedClothesMypageView, PickedClothesDetailView, PickedClothesLikeCancelView, RecommendedGoodsView
# from .views import  CreatePickedView
router = DefaultRouter()
# router.register(r'recommends', RecommendedViewSet)
# router.register(r"picks", PickedViewSet)

urlpatterns = [
    # path('recommend_goods/', RecommendedGoodsView.as_view(), name='recommed_goods'),
    # ;;; path('picked_clothes/main/', PickedClothesMainView.as_view(), name='picked_clothes_main'),
    # path('picked_clothes/mypage/', PickedClothesMypageView.as_view(), name='picked_clothes_mypage'),
    # path('clothes/detail/', PickedClothesDetailView.as_view(), name='picked_clothes_detail'),
    # # path('picked_clothes/add/', PickedClothesLikeAddView.as_view(), name='picked_clothes/add'),
    # path('picked_clothes/delete/', PickedClothesLikeCancelView.as_view(), name='picked_clothes_delete'),
    path("", include(router.urls)),
    # path('create-recommended/', CreateRecommendedView.as_view(), name='create-recommended'),
]
