from django.urls import path
from .views import SignupView, LoginView, UpdateView, ChangePasswordView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('update/', UpdateView.as_view(), name='update'),
    path('change_password/', ChangePasswordView.as_view(), name='change_password'),
    
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # JWT 토큰 발급
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # JWT 토큰 갱신  
]