from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from .serializers import (
    SignupSerializer,
    LoginSerializer,
    UpdateSerializer,
    ChangePasswordSerializer,
    FindEmailSerializer,UserImageUploadSerializer,
    FindEmailSerializer,
    ImageUploadSerializer,
    UserImageUploadSerializer
)
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from drf_yasg.utils import swagger_auto_schema
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from datetime import datetime
from django.core.files.storage import default_storage

from django.core.files.base import ContentFile
import base64
import uuid


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
        user = request.user  # ✅ 현재 로그인한 사용자

        return Response({
            "username": user.username,
            "email": user.email,
            "height": user.height,
            "weight": user.weight
        }, status=status.HTTP_200_OK)
        

class UserImageUploadView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, format=None):
        serializer = UserImageUploadSerializer(data=request.data, instance=request.user)
        
        if serializer.is_valid():
            serializer.save()
            return Response({'success': '이미지가 성공적으로 업로드되었습니다.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class SimpleImageUploadView(APIView):
    def post(self, request, format=None):
        try:
            # base64 이미지 데이터 가져오기
            image_data = request.data.get('image', None)
            
            if not image_data:
                return Response({'error': '이미지 데이터가 필요합니다.'}, status=status.HTTP_400_BAD_REQUEST)
                
            if isinstance(image_data, str) and image_data.startswith('data:image'):
                # base64 데이터에서 형식 및 인코딩 데이터 추출
                format, imgstr = image_data.split(';base64,') 
                ext = format.split('/')[-1]
                
                # 임시 파일명 생성 (user_upload_path 함수에 의해 변경됨)
                temp_filename = f"temp.{ext}"
                
                # base64 디코딩 및 ContentFile 생성
                decoded_image = ContentFile(base64.b64decode(imgstr), name=temp_filename)
                
                # 모델 대신 직접 파일 저장
                from django.core.files.storage import default_storage
                # user_id 0으로 고정하고 경로 지정 (커스텀 경로 생성)
                from datetime import datetime
                timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
                file_path = f'user_uploads/webcam/{timestamp}.{ext}'
                
                # 파일 저장
                path = default_storage.save(file_path, decoded_image)
                
                # 저장된 URL 반환
                file_url = default_storage.url(path)
                
                return Response({
                    'success': '이미지가 성공적으로 업로드되었습니다.',
                    'file_url': file_url
                }, status=status.HTTP_200_OK)
            else:
                return Response({'error': '유효한 base64 이미지 형식이 아닙니다.'}, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)