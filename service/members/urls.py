from django.urls import path
from .views import SignupView, LoginView, UpdateView, ChangePasswordView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('update/', UpdateView.as_view(), name='update'),
    path('change_password/', ChangePasswordView.as_view(), name='change_password'),
]