from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def save_user(self, request, sociallogin, form=None):
        # 기본 사용자 저장 로직 실행
        user = super().save_user(request, sociallogin, form)
        return user

    def get_connect_redirect_url(self, request, socialaccount):
        # 소셜 계정 연결 후 리다이렉트 URL
        refresh = RefreshToken.for_user(socialaccount.user)
        token = str(refresh.access_token)
        refresh_token = str(refresh)

        # 프론트엔드 콜백 URL에 토큰 추가
        path = super().get_connect_redirect_url(request, socialaccount)
        return f"{path}?token={token}&refresh={refresh_token}"

    def get_login_redirect_url(self, request):
        # 소셜 로그인 후 리다이렉트 URL
        if request.user.is_authenticated:
            refresh = RefreshToken.for_user(request.user)
            token = str(refresh.access_token)
            refresh_token = str(refresh)

            # 프론트엔드 URL (콘솔에 출력)
            print(f"토큰: {token}")
            print(f"리프레시: {refresh_token}")

            # 프론트엔드 URL
            frontend_url = "http://localhost:3000/main"

            # 토큰을 쿼리 파라미터로 추가
            return f"{frontend_url}?token={token}&refresh={refresh_token}"

        return super().get_login_redirect_url(request)
