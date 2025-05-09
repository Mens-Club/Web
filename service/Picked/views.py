from django.utils import timezone
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import Picked, MainPicked, MainRecommend
from .serializers import LikeSerializer, MainLikeSerializer, MainTableSerializer, PickedSerializer, MainPickedSerializer

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

class MainRandomAPIView(APIView):
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('count', openapi.IN_QUERY, description='추출 개수', type=openapi.TYPE_INTEGER, required=False)
        ]
    )
    def get(self, request):
        count = int(request.query_params.get('count'))
        items = MainRecommend.objects.order_by('?')[:count]
        return Response(MainTableSerializer(items, many=True).data)

class MainByPriceAPIView(APIView):
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('brackets', openapi.IN_QUERY, description='콤마 구분 가격 구간 (예: 100000,200000,300000)', type=openapi.TYPE_STRING, required=False),
            openapi.Parameter('per', openapi.IN_QUERY, description='구간당 개수', type=openapi.TYPE_INTEGER, required=False),
        ]
    )
    def get(self, request):
        raw = request.query_params.get('brackets', '100000,200000,300000')
        per = int(request.query_params.get('per'))
        bracket_values = [int(x) for x in raw.split(',') if x.isdigit()]
        data = {}
        for b in bracket_values:
            items = MainRecommend.objects.filter(
                total_price__gte=b,
                total_price__lt=b + 100000
            ).order_by('?')[:per]
            data[f"{b//10000}만원대"] = MainTableSerializer(items, many=True).data
        return Response(data)

class MainByStyleAPIView(APIView):
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('style', openapi.IN_QUERY, description='스타일 필터 (미니멀, 캐주얼)', type=openapi.TYPE_STRING, required=True),
            openapi.Parameter('count', openapi.IN_QUERY, description='추출 개수', type=openapi.TYPE_INTEGER, required=False)
        ]
    )
    def get(self, request):
        style = request.query_params.get('style')
        if style not in ['미니멀', '캐주얼']:
            return Response({"detail": "style 파라미터: 미니멀 or 캐주얼"}, status=status.HTTP_400_BAD_REQUEST)
        count = int(request.query_params.get('count'))
        items = MainRecommend.objects.filter(style=style).order_by('?')[:count]
        return Response(MainTableSerializer(items, many=True).data)

class PickedByTimeAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('user_id', openapi.IN_QUERY, description='사용자 ID', type=openapi.TYPE_INTEGER, required=True),
            openapi.Parameter('order', openapi.IN_QUERY, description='정렬 (newest 또는 oldest)', type=openapi.TYPE_STRING, required=False),
        ]
    )
    def get(self, request):
        user_id = request.query_params.get('user_id')
        order = request.query_params.get('order', 'newest')
        if not user_id:
            return Response({"detail": "user_id 필요"}, status=status.HTTP_400_BAD_REQUEST)

        qs = Picked.objects.filter(user_id=user_id).select_related('recommend')
        if order == 'newest':
            qs = qs.order_by('-created_at')
        else:
            qs = qs.order_by('created_at')

        serializer = PickedSerializer(qs, many=True)
        return Response(serializer.data)

class PickedByPriceAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('user_id', openapi.IN_QUERY, description='사용자 ID', type=openapi.TYPE_INTEGER, required=True),
            openapi.Parameter('sort', openapi.IN_QUERY, description='정렬 (high 또는 low)', type=openapi.TYPE_STRING, required=True)
        ]
    )
    def get(self, request):
        user_id = request.query_params.get('user_id')
        sort = request.query_params.get('sort')
        if not user_id or sort not in ['high', 'low']:
            return Response({"detail": "user_id 및 sort(high/low) 필요"}, status=status.HTTP_400_BAD_REQUEST)

        qs = Picked.objects.filter(user_id=user_id).select_related('recommend')
        if sort == 'high':
            qs = qs.order_by('-recommend__total_price')
        else:
            qs = qs.order_by('recommend__total_price')

        serializer = PickedSerializer(qs, many=True)
        return Response(serializer.data)

class PickedByStyleAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('user_id', openapi.IN_QUERY, description='사용자 ID', type=openapi.TYPE_INTEGER, required=True),
            openapi.Parameter('style', openapi.IN_QUERY, description='스타일 (미니멀 또는 캐주얼)', type=openapi.TYPE_STRING, required=True),
        ]
    )
    def get(self, request):
        user_id = request.query_params.get('user_id')
        style = request.query_params.get('style')
        if not user_id or style not in ['미니멀', '캐주얼']:
            return Response({"detail": "user_id 및 style(미니멀/캐주얼) 필요"}, status=status.HTTP_400_BAD_REQUEST)

        qs = Picked.objects.filter(user_id=user_id, recommend__style=style).select_related('recommend')
        serializer = PickedSerializer(qs, many=True)
        return Response(serializer.data)

class MainPickedByTimeAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('user_id', openapi.IN_QUERY, description='사용자 ID', type=openapi.TYPE_INTEGER, required=True),
            openapi.Parameter('order', openapi.IN_QUERY, description='정렬 (newest 또는 oldest)', type=openapi.TYPE_STRING, required=False),
        ]
    )
    def get(self, request):
        user_id = request.query_params.get('user_id')
        order = request.query_params.get('order', 'newest')
        if not user_id:
            return Response({"detail": "user_id 필요"}, status=status.HTTP_400_BAD_REQUEST)

        qs = MainPicked.objects.filter(user_id=user_id).select_related('main_recommend')
        if order == 'newest':
            qs = qs.order_by('-created_at')
        else:
            qs = qs.order_by('created_at')

        serializer = MainPickedSerializer(qs, many=True)
        return Response(serializer.data)

class MainPickedByPriceAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('user_id', openapi.IN_QUERY, description='사용자 ID', type=openapi.TYPE_INTEGER, required=True),
            openapi.Parameter('sort', openapi.IN_QUERY, description='정렬 (high 또는 low)', type=openapi.TYPE_STRING, required=True)
        ]
    )
    def get(self, request):
        user_id = request.query_params.get('user_id')
        sort = request.query_params.get('sort')
        if not user_id or sort not in ['high', 'low']:
            return Response({"detail": "user_id 및 sort(high/low) 필요"}, status=status.HTTP_400_BAD_REQUEST)

        qs = MainPicked.objects.filter(user_id=user_id).select_related('main_recommend')
        if sort == 'high':
            qs = qs.order_by('-main_recommend__total_price')
        else:
            qs = qs.order_by('main_recommend__total_price')

        serializer = MainPickedSerializer(qs, many=True)
        return Response(serializer.data)

class MainPickedByStyleAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('user_id', openapi.IN_QUERY, description='사용자 ID', type=openapi.TYPE_INTEGER, required=True),
            openapi.Parameter('style', openapi.IN_QUERY, description='스타일 (미니멀 또는 캐주얼)', type=openapi.TYPE_STRING, required=True),
        ]
    )
    def get(self, request):
        user_id = request.query_params.get('user_id')
        style = request.query_params.get('style')
        if not user_id or style not in ['미니멀', '캐주얼']:
            return Response({"detail": "user_id 및 style(미니멀/캐주얼) 필요"}, status=status.HTTP_400_BAD_REQUEST)

        qs = MainPicked.objects.filter(user_id=user_id, main_recommend__style=style).select_related('main_recommend')
        serializer = MainPickedSerializer(qs, many=True)
        return Response(serializer.data)