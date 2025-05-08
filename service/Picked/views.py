# Picked/views.py
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import Picked, MainPicked
from django.utils import timezone
from .serializers import LikeSerializer, MainLikeSerializer

class LikeView(APIView):
    @swagger_auto_schema(
        operation_description="좋아요를 누른 후 추천 항목을 기록합니다.",
        request_body=LikeSerializer,
        responses={
            201: openapi.Response('Liked successfully!', schema=LikeSerializer),
            200: openapi.Response('Already liked.', schema=LikeSerializer),
            400: openapi.Response('Bad Request'),
        }
    )
    def post(self, request):
        serializer = LikeSerializer(data=request.data)
        if serializer.is_valid():
            recommend_id = serializer.validated_data['recommend_id']
            user = request.user

            # 이미 추천을 눌렀는지 확인
            if Picked.objects.filter(user=user, recommend_id=recommend_id).exists():
                return Response({'message': 'Already liked.'}, status=status.HTTP_200_OK)

            # 추천을 추가
            Picked.objects.create(
                user=user,
                recommend_id=recommend_id,
                created_at=timezone.now()
            )
            return Response({'message': 'Liked successfully!'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MainLikeView(APIView):
    @swagger_auto_schema(
        operation_description="Main 추천 항목을 선택하여 저장합니다.",
        request_body=MainLikeSerializer,
        responses={
            201: openapi.Response('Main picked successfully!', schema=MainLikeSerializer),
            200: openapi.Response('Already picked.', schema=MainLikeSerializer),
            400: openapi.Response('Bad Request'),
        }
    )
    def post(self, request):
        serializer = MainLikeSerializer(data=request.data)
        if serializer.is_valid():
            main_recommend_id = serializer.validated_data['main_recommend_id']
            user = request.user

            # 이미 선택된 항목인지 확인
            if MainPicked.objects.filter(user=user, recommend_id=main_recommend_id).exists():
                return Response({'message': 'Already picked.'}, status=status.HTTP_200_OK)

            # 선택 항목 추가
            MainPicked.objects.create(
                user=user,
                recommend_id=main_recommend_id,
                created_at=timezone.now()
            )
            return Response({'message': 'Main picked successfully!'}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)