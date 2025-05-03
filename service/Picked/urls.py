from django.urls import path
from .views import PickView

urlpatterns = [
    path('pick/', PickView.as_view(), name='pick'),
]