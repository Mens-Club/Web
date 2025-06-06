from django.conf import settings
from django.contrib.auth import get_user_model
from django.http import HttpResponseRedirect
from django.shortcuts import redirect
from django.utils import timezone
from django.views.generic import View
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.generics import CreateAPIView, GenericAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from .serializers import (
    ChangePasswordSerializer,
    FindEmailSerializer,
    LoginSerializer,
    SignupSerializer,
    UpdateSerializer,
    UserImageUploadSerializer,
)
import json, os, redis, requests

CACHE_URL = os.getenv("CACHE_URL", "redis://localhost:6379/0")
redis_client = redis.from_url(CACHE_URL, decode_responses=True)

User = get_user_model()


class SignupView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = SignupSerializer
    permission_classes = [AllowAny]  # 인증 없이 접근 가능


class LoginView(APIView):
    permission_classes = [AllowAny]  # 인증 없이 접근 가능

    @swagger_auto_schema(request_body=LoginSerializer)
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]

            user.last_login = timezone.now()
            user.save(update_fields=["last_login"])

            # JWT 토큰 발급
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            return Response(
                {
                    "message": "로그인 성공",
                    "username": user.username,
                    "access_token": access_token,
                    "refresh_token": str(refresh),
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SocialLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        provider = request.data.get("provider")
        email = None
        social_id = None

        if provider == "google":
            id_token = request.data.get("id_token")
            google_api = f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
            resp = requests.get(google_api)
            if resp.status_code != 200:
                return Response({"error": "Invalid Google token"}, status=400)
            google_user = resp.json()
            email = google_user.get("email")
            social_id = google_user.get("sub")

        elif provider == "kakao":
            access_token = request.data.get("access_token")
            user_info, error_response = self.verify_kakao_token_and_get_userinfo(
                access_token
            )
            if error_response:
                return error_response
            email = user_info.get("email")
            social_id = user_info.get("kakao_id")

        elif provider == "naver":
            access_token = request.data.get("access_token")
            user_info, error_response = self.verify_naver_token_and_get_userinfo(
                access_token,
                settings.NAVER_CLIENT_ID,
                settings.NAVER_SECRET,
            )
            if error_response:
                return error_response
            email = user_info.get("email")
            social_id = user_info.get("naver_id")

        else:
            return Response({"error": "지원하지 않는 provider"}, status=400)

        if not email or not social_id:
            return Response({"error": "필수 정보가 없습니다."}, status=400)

        # 이메일로 사용자 찾기 또는 생성
        user, created = User.objects.get_or_create(
            email=email, defaults={"username": f"{provider}_{social_id}"}
        )

        # JWT 토큰 발급
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        return Response(
            {
                "message": f"{provider} 로그인 성공",
                "username": user.username,
                "access_token": access_token,
                "refresh_token": str(refresh),
            },
            status=status.HTTP_200_OK,
        )

    def verify_kakao_token_and_get_userinfo(self, access_token):
        token_info_url = "https://kapi.kakao.com/v1/user/access_token_info"
        headers = {"Authorization": f"Bearer {access_token}"}
        token_resp = requests.get(token_info_url, headers=headers)
        if token_resp.status_code != 200:
            return None, Response({"error": "유효하지 않은 카카오 토큰"}, status=400)
        user_info_url = "https://kapi.kakao.com/v2/user/me"
        user_resp = requests.get(user_info_url, headers=headers)
        if user_resp.status_code != 200:
            return None, Response({"error": "카카오 사용자 정보 조회 실패"}, status=400)
        user_json = user_resp.json()
        kakao_id = user_json.get("id")
        kakao_account = user_json.get("kakao_account", {})
        email = kakao_account.get("email")
        return {
            "kakao_id": kakao_id,
            "email": email,
        }, None

    def verify_naver_token_and_get_userinfo(
        self, access_token, client_id, client_secret
    ):
        user_info_url = "https://openapi.naver.com/v1/nid/me"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "X-Naver-Client-Id": client_id,
            "X-Naver-Client-Secret": client_secret,
        }
        resp = requests.get(user_info_url, headers=headers)
        if resp.status_code != 200:
            return None, Response({"error": "네이버 사용자 정보 조회 실패"}, status=400)
        user_json = resp.json()
        if user_json.get("resultcode") != "00":
            return None, Response({"error": "유효하지 않은 네이버 토큰"}, status=400)
        response = user_json.get("response", {})
        naver_id = response.get("id")
        email = response.get("email")
        return {
            "naver_id": naver_id,
            "email": email,
        }, None


class SocialLoginCallbackView(View):
    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            # JWT 토큰 생성
            refresh = RefreshToken.for_user(request.user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            # ======  디버깅 로그 ======
            print(f"인증된 사용자: {request.user.username}")
            print(f"토큰: {access_token}")
            print(f"리프레시: {refresh_token}")

            # 프론트엔드 리다이렉트 URL
            frontend_url = "https://mensclub-fashion.store/social-callback"
            # frontend_url = "http://localhost:3000/social-callback"

            # 토큰을 쿼리 파라미터로 추가하여 리다이렉트
            redirect_url = (
                f"{frontend_url}?token={access_token}&refresh={refresh_token}"
            )
            print(f"리다이렉트 URL: {redirect_url}")

            return HttpResponseRedirect(redirect_url)

        # 인증되지 않은 경우 로그인 페이지로 리다이렉트
        return redirect("/")


class UpdateView(RetrieveUpdateAPIView):
    serializer_class = UpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    @swagger_auto_schema(request_body=UpdateSerializer)
    def put(self, request):
        user = request.user
        serializer = UpdateSerializer(user, data=request.data)

        if serializer.is_valid():
            serializer.save()

            # 캐시 삭제
            cache_key = f"user_info:{user.id}"
            redis_client.delete(cache_key)

            return Response(
                {
                    "message": "회원 정보가 성공적으로 수정되었습니다.",
                    "user": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]  # 로그인된 사용자만 접근 가능

    @swagger_auto_schema(request_body=ChangePasswordSerializer)
    def put(self, request):
        user = request.user
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )

        if serializer.is_valid():
            # 새 비밀번호로 변경
            user.set_password(serializer.validated_data["new_password"])
            user.save()
            return Response(
                {"message": "비밀번호가 성공적으로 변경되었습니다."},
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        user.delete()
        return Response(
            {"message": "회원 탈퇴가 완료되었습니다."},
            status=status.HTTP_204_NO_CONTENT,
        )


class FindEmailView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(request_body=FindEmailSerializer)
    def post(self, request):
        serializer = FindEmailSerializer(data=request.data)
        if serializer.is_valid():
            user = User.objects.get(username=serializer.validated_data["username"])
            return Response(
                {"message": "이메일을 찾았습니다.", "email": user.email},
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        cache_key = f"user_info:{user.id}"

        # Redis에서 캐시 조회
        cached = redis_client.get(cache_key)
        if cached:
            data = json.loads(cached)
            return Response(data, status=status.HTTP_200_OK)

        # 캐시 없으면 DB에서 가져오기
        data = {
            "user_id": user.id,
            "username": user.username,
            "email": user.email,
            "height": user.height,
            "weight": user.weight,
        }

        # Redis에 캐시 저장 (예: 300초 = 5분)
        redis_client.set(cache_key, json.dumps(data), ex=300)

        return Response(data, status=status.HTTP_200_OK)


class UserImageUploadView(GenericAPIView):
    serializer_class = UserImageUploadSerializer
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="사용자 이미지 업로드",
        manual_parameters=[],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["image"],
            properties={
                "image": openapi.Schema(
                    type=openapi.TYPE_FILE, description="이미지 파일"
                ),
            },
        ),
        responses={200: "이미지가 성공적으로 업로드되었습니다."},
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data, context={"user": request.user}
        )
        if serializer.is_valid():
            result = serializer.save()
            return Response(
                {
                    "success": "이미지가 성공적으로 업로드되었습니다.",
                    "image_url": result.image.url,  # 실제 접근 가능한 URL 반환
                    "user_id": request.user.id,
                },
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
