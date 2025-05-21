from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login
from django.conf import settings


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):

    def post_social_login(self, request, sociallogin):
        # 강제로 로그인 상태 만들기
        login(request, sociallogin.user)

        # JWT 토큰 생성
        refresh = RefreshToken.for_user(sociallogin.user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # 토큰을 세션에 저장해서 리다이렉트 URL에서 꺼낼 수 있게 함
        request.session["access_token"] = access_token
        request.session["refresh_token"] = refresh_token
        request.session["provider"] = sociallogin.account.provider

    def get_login_redirect_url(self, request):
        access_token = request.session.pop("access_token", None)
        refresh_token = request.session.pop("refresh_token", None)
        provider = request.session.pop("provider", "kakao")

        if access_token and refresh_token:
            return f"https://mensclub-fashion.store/oauth/{provider}/callback?token={access_token}&refresh={refresh_token}"
        else:
            # 토큰이 없으면 로그인 실패 페이지 혹은 기본 리다이렉트
            return super().get_login_redirect_url(request)
