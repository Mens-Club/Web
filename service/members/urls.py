from django.urls import path, include
from .views import (
    SignupView,
    LoginView,
    UpdateView,
    ChangePasswordView,
    DeleteView,
    FindEmailView,
    UserInfoView,
    UserImageUploadView,
    SocialLoginView,
    SocialLoginCallbackView,
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("signup/", SignupView.as_view(), name="signup"),
    path("login/", LoginView.as_view(), name="login"),
    path("social-login/", SocialLoginView.as_view(), name="social-login"),
    path("accounts/", include("allauth.urls")),
    path("update/", UpdateView.as_view(), name="update"),
    path("change_password/", ChangePasswordView.as_view(), name="change_password"),
    path("delete/", DeleteView.as_view(), name="delete"),
    path("find_email/", FindEmailView.as_view(), name="find_email"),
    path("user_info/", UserInfoView.as_view(), name="user_info"),
    # JWT 발급
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    # JWT 갱신
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("upload-image/", UserImageUploadView.as_view(), name="s3-upload-test"),
    path("social-callback/", SocialLoginCallbackView.as_view(), name="social-callback"),
]
