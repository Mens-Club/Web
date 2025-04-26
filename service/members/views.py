from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from .serializers import (
    SignupSerializer,
    LoginSerializer,
    UpdateSerializer,
    ChangePasswordSerializer,
    FindEmailSerializer,
    UserInfoRequestSerializer
)
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from drf_yasg import openapi

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


class UpdateView(RetrieveUpdateAPIView):
    serializer_class = UpdateSerializer
    permission_classes = [IsAuthenticated]  # 로그인한 사용자만 접근 가능

    @swagger_auto_schema(request_body=UpdateSerializer)
    def put(self, request):
        user = request.user  # JWT 토큰을 통해 로그인된 사용자 정보 가져오기
        serializer = UpdateSerializer(user, data=request.data)

        if serializer.is_valid():
            serializer.save()  # 데이터 업데이트
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
        return Response({"message": "회원 탈퇴가 완료되었습니다."}, status=status.HTTP_204_NO_CONTENT)
    
class FindEmailView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(request_body=FindEmailSerializer)
    def post(self, request):
        serializer = FindEmailSerializer(data=request.data)
        if serializer.is_valid():
            user = User.objects.get(username=serializer.validated_data['username'])
            return Response({
                "message": "이메일을 찾았습니다.",
                "email": user.email
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class UserInfoView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(manual_parameters=[
        openapi.Parameter('username', openapi.IN_QUERY, description="Username", type=openapi.TYPE_STRING)
    ])
    def get(self, request):
        username = request.query_params.get('username')

        if not username:
            return Response({"error": "username 쿼리 파라미터가 필요합니다."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(username=username)
            return Response({
                "username": user.username,
                "email": user.email,       # ← 여기 추가
                "height": user.height,
                "weight": user.weight
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "해당 사용자가 존재하지 않습니다."}, status=status.HTTP_404_NOT_FOUND)
