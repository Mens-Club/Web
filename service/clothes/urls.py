from django.urls import path
from .views import RandomGoodsAPIView, SaveImageAPIView

urlpatterns = [
    path('random-clothing/', RandomGoodsAPIView.as_view(), name='random_clothing'),
    path('save_image/', SaveImageAPIView.as_view(), name='save_image'),
]