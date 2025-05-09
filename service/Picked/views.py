from django.utils import timezone
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import Picked, MainPicked
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

            if Picked.objects.filter(user=user, recommend_id=recommend_id).exists():
                return Response({'message': 'Already liked.'}, status=status.HTTP_200_OK)

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

            if MainPicked.objects.filter(user=user, recommend_id=main_recommend_id).exists():
                return Response({'message': 'Already picked.'}, status=status.HTTP_200_OK)

            MainPicked.objects.create(
                user=user,
                recommend_id=main_recommend_id,
                created_at=timezone.now()
            )
            return Response({'message': 'Main picked successfully!'}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class LikeCancelView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'recommend_id', openapi.IN_QUERY, type=openapi.TYPE_INTEGER,
                required=True, description="좋아요를 취소할 recommendation의 ID"
            )
        ])
    def delete(self, request):
        user = request.user
        recommend_id = request.query_params.get('recommend_id')

        if not recommend_id:
            return Response({"error": "recommend_id가 필요합니다."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            picked = Picked.objects.get(user_id=user.id, recommend_id=recommend_id)
            picked.delete()
            return Response({"message": "좋아요가 취소되었습니다."}, status=status.HTTP_204_NO_CONTENT)
        except Picked.DoesNotExist:
            return Response({"error": "좋아요가 존재하지 않습니다."}, status=status.HTTP_404_NOT_FOUND)
        
class MainLikeCancelView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="main_picked 좋아요 취소",
        manual_parameters=[
            openapi.Parameter(
                'recommend_id', openapi.IN_QUERY,
                description="recommend_id 값 (main_recommend 테이블의 id)",
                type=openapi.TYPE_INTEGER,
                required=True,
            )
        ]
    )
    def delete(self, request):
        user = request.user
        recommend_id = request.query_params.get('recommend_id')

        if not recommend_id:
            return Response({"error": "recommend_id가 필요합니다."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            picked = MainPicked.objects.get(user_id=user.id, recommend_id=recommend_id)
            picked.delete()
            return Response({"message": "좋아요가 취소되었습니다."}, status=status.HTTP_204_NO_CONTENT)
        except MainPicked.DoesNotExist:
            return Response({"error": "좋아요 정보가 존재하지 않습니다."}, status=status.HTTP_404_NOT_FOUND)