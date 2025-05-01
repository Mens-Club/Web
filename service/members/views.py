from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from .serializers import (
    SignupSerializer,
    LoginSerializer,
    UpdateSerializer,
    ChangePasswordSerializer,
    FindEmailSerializer,
)
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from drf_yasg.utils import swagger_auto_schema
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from .storage import upload_base64_to_s3


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
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user  # ✅ 현재 로그인한 사용자

        return Response({
            "username": user.username,
            "email": user.email,
            "height": user.height,
            "weight": user.weight
        }, status=status.HTTP_200_OK)
        
class ImageUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # base64 이미지 데이터 받기
        base64_image = request.data.get('image')
        
        if not base64_image:
            return Response(
                {'detail': '이미지 데이터가 없습니다.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # S3 업로드 및 URL 생성
            photo_url = upload_base64_to_s3(
                base64_image, 
                request.user.id
            )
            
            # 사용자 모델 업데이트 (선택사항)
            request.user.upload_picture = photo_url
            request.user.save()
            
            return Response({
                'image_url': photo_url
            }, status=status.HTTP_201_CREATED)
        
        except ValueError as e:
            return Response(
                {'detail': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )