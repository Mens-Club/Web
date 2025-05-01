from django.urls import path
from .views import PickedClothesMainView, PickedClothesMypageView, PickedClothesDetailView, PickedClothesLikeAddView, PickedClothesLikeCancelView, RecommendedGoodsView

urlpatterns = [
    path('recommend_goods/', RecommendedGoodsView.as_view(), name='recommed_goods'),
    path('picked_clothes/main/', PickedClothesMainView.as_view(), name='picked_clothes_main'),
    path('picked_clothes/mypage/', PickedClothesMypageView.as_view(), name='picked_clothes_mypage'),
    path('picked_clothes/detail/', PickedClothesDetailView.as_view(), name='picked_clothes_detail'),
    path('picked_clothes/add/', PickedClothesLikeAddView.as_view(), name='picked_clothes/add'),
    path('picked_clothes/delete/', PickedClothesLikeCancelView.as_view(), name='picked_clothes_delete'),
]