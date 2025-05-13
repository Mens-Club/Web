from django.utils import timezone
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework import status
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from recommend.models import Recommendation, RecommendationBookmark, MainRecommendation, MainRecommendationBookmark
from .serializers import RecommendationSerializer, MainRecommendationSerializer, RecommendationBookmarkSerializer, MainRecommendationBookmarkSerializer

class RecommendPicked(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="추천 좋아요 토글",
        operation_description="recommendation_id를 받아 좋아요(Bookmark)를 토글합니다. 없으면 생성하고, 있으면 삭제합니다.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["recommendation_id"],
            properties={
                "recommendation_id": openapi.Schema(type=openapi.TYPE_INTEGER, description="추천 ID"),
            },
        ),
        responses={
            200: openapi.Response(description="Bookmark toggled successfully."),
            201: openapi.Response(description="Bookmark created."),
            400: openapi.Response(description="recommendation_id is required."),
            404: openapi.Response(description="Recommendation not found."),
        }
    )
    def post(self, request):
        user = request.user
        recommendation_id = request.data.get("recommendation_id")

        if not recommendation_id:
            return Response({"error": "recommendation_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            recommendation = Recommendation.objects.get(id=recommendation_id)
        except Recommendation.DoesNotExist:
            return Response({"error": "Recommendation not found."}, status=status.HTTP_404_NOT_FOUND)

        # 기존 북마크가 있는지 확인
        try:
            bookmark = RecommendationBookmark.objects.get(user=user, recommendation=recommendation)
            # 북마크가 있으면 삭제
            bookmark.delete()
            return Response({
                "message": "Bookmark deleted.",
                "status": "deleted"
            }, status=status.HTTP_200_OK)
        except RecommendationBookmark.DoesNotExist:
            # 북마크가 없으면 생성
            RecommendationBookmark.objects.create(
                user=user,
                recommendation=recommendation,
                created_at=timezone.now()
            )
            return Response({
                "message": "Bookmark created.",
                "status": "created"
            }, status=status.HTTP_201_CREATED)

class MainPicked(APIView):
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_summary="메인 추천 좋아요 토글",
        operation_description="main_recommendation_id를 받아 MainRecommendation에 좋아요(Bookmark)를 토글합니다. 없으면 생성하고, 있으면 삭제합니다.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["main_recommendation_id"],
            properties={
                "main_recommendation_id": openapi.Schema(type=openapi.TYPE_INTEGER, description="MainRecommendation ID"),
            },
        ),
        responses={
            200: openapi.Response(description="Bookmark toggled successfully."),
            201: openapi.Response(description="Bookmark created."),
            400: openapi.Response(description="main_recommendation_id is required."),
            404: openapi.Response(description="MainRecommendation not found."),
        }
    )
    def post(self, request):
        user = request.user
        main_recommendation_id = request.data.get("main_recommendation_id")

        if not main_recommendation_id:
            return Response({"error": "main_recommendation_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            main_recommendation = MainRecommendation.objects.get(id=main_recommendation_id)
        except MainRecommendation.DoesNotExist:
            return Response({"error": "MainRecommendation not found."}, status=status.HTTP_404_NOT_FOUND)

        # 기존 북마크가 있는지 확인
        try:
            bookmark = MainRecommendationBookmark.objects.get(user=user, main_recommendation=main_recommendation)
            # 북마크가 있으면 삭제
            bookmark.delete()
            return Response({
                "message": "Bookmark deleted.",
                "status": "deleted"
            }, status=status.HTTP_200_OK)
        except MainRecommendationBookmark.DoesNotExist:
            # 북마크가 없으면 생성
            MainRecommendationBookmark.objects.create(
                user=user,
                main_recommendation=main_recommendation,
                created_at=timezone.now()
            )
            return Response({
                "message": "Bookmark created.",
                "status": "created"
            }, status=status.HTTP_201_CREATED)
        
class MainRandomAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                "count",
                openapi.IN_QUERY,
                description="추출 개수",
                type=openapi.TYPE_INTEGER,
                required=False,
            )
        ]
    )
    def get(self, request):
        count = int(request.query_params.get("count", 3))  # count가 없으면 기본값 3
        items = MainRecommendation.objects.order_by("?")[:count]
        return Response(MainRecommendationSerializer(items, many=True).data)

class MainByPriceAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                "brackets",
                openapi.IN_QUERY,
                description="콤마 구분 가격 구간 (예: 100000,200000,300000)",
                type=openapi.TYPE_STRING,
                required=False,
            ),
            openapi.Parameter(
                "per",
                openapi.IN_QUERY,
                description="구간당 개수",
                type=openapi.TYPE_INTEGER,
                required=False,
            ),
        ]
    )
    def get(self, request):
        raw = request.query_params.get("brackets", "100000,200000,300000")
        per = int(request.query_params.get("per", 3))  # 기본값 3
        bracket_values = [int(x) for x in raw.split(",") if x.isdigit()]
        data = {}

        # 가격 구간별로 아이템을 랜덤하게 추출
        for b in bracket_values:
            items = MainRecommendation.objects.filter(
                total_price__gte=b, total_price__lt=b + 100000
            ).order_by("?")[:per]  # 구간당 'per' 개수만큼 랜덤으로 추출
            data[f"{b//10000}만원대"] = MainRecommendationSerializer(items, many=True).data

        return Response(data)

class MainByStyleAPIView(APIView):
    permission_classes = [IsAuthenticated] # 추후수정

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                "style",
                openapi.IN_QUERY,
                description="스타일 필터 (미니멀, 캐주얼)",
                type=openapi.TYPE_STRING,
                required=True,
            ),
            openapi.Parameter(
                "count",
                openapi.IN_QUERY,
                description="추출 개수",
                type=openapi.TYPE_INTEGER,
                required=False,
            ),
        ]
    )
    def get(self, request):
        # style 파라미터 받기
        style = request.query_params.get("style")
        if style not in ["미니멀", "캐주얼"]:
            return Response(
                {"detail": "style 파라미터: 미니멀 or 캐주얼"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # count 파라미터 받기 (기본값 3)
        count = int(request.query_params.get("count", 3))

        # 스타일에 맞는 데이터 필터링 후 랜덤으로 추출
        items = MainRecommendation.objects.filter(style=style).order_by("?")[:count]

        # 직렬화하여 응답
        return Response(MainRecommendationSerializer(items, many=True).data)
    
class RecommendBookmarkByTimeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                "user_id",
                openapi.IN_QUERY,
                description="사용자 ID",
                type=openapi.TYPE_INTEGER,
                required=True,
            ),
            openapi.Parameter(
                "order",
                openapi.IN_QUERY,
                description="정렬 (newest 또는 oldest)",
                type=openapi.TYPE_STRING,
                required=False,
            ),
        ]
    )
    def get(self, request):
        user_id = request.query_params.get("user_id")
        order = request.query_params.get("order", "newest")
        
        if not user_id:
            return Response(
                {"detail": "user_id 필요"}, status=status.HTTP_400_BAD_REQUEST
            )

        # user_id로 필터링된 북마크 데이터 가져오기
        qs = RecommendationBookmark.objects.filter(user_id=user_id).select_related('recommendation')

        # 정렬 방식 처리
        if order == 'newest':
            qs = qs.order_by('-created_at')
        else:
            qs = qs.order_by('created_at')

        # 직렬화
        serializer = RecommendationBookmarkSerializer(qs, many=True)
        return Response(serializer.data)  

class RecommendBookmarkByPriceAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'user_id',
                openapi.IN_QUERY,
                description='사용자 ID',
                type=openapi.TYPE_INTEGER,
                required=True,
            ),
            openapi.Parameter(
                'sort',
                openapi.IN_QUERY,
                description='정렬 (high 또는 low)',
                type=openapi.TYPE_STRING,
                required=True,
            ),
        ]
    )
    def get(self, request):
        user_id = request.query_params.get("user_id")
        sort = request.query_params.get("sort")
        
        if not user_id or sort not in ["high", "low"]:
            return Response(
                {"detail": "user_id 및 sort(high/low) 필요"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 북마크된 추천 아이템 가져오기
        qs = RecommendationBookmark.objects.filter(user_id=user_id).select_related('recommendation')

        # 가격에 따른 정렬
        if sort == 'high':
            qs = qs.order_by('-recommendation__total_price')  # 가격이 높은 순
        else:
            qs = qs.order_by('recommendation__total_price')  # 가격이 낮은 순

        # 직렬화 후 응답
        serializer = RecommendationBookmarkSerializer(qs, many=True)
        return Response(serializer.data)
    
class RecommendBookmarkByStyleAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                "user_id",
                openapi.IN_QUERY,
                description="사용자 ID",
                type=openapi.TYPE_INTEGER,
                required=True,
            ),
            openapi.Parameter(
                "style",
                openapi.IN_QUERY,
                description="스타일 (미니멀 또는 캐주얼)",
                type=openapi.TYPE_STRING,
                required=True,
            ),
        ]
    )
    def get(self, request):
        user_id = request.query_params.get('user_id')
        style = request.query_params.get('style')
        
        # 필수 파라미터 확인
        if not user_id or style not in ['미니멀', '캐주얼']:
            return Response({"detail": "user_id 및 style(미니멀/캐주얼) 필요"}, status=status.HTTP_400_BAD_REQUEST)

        # recommendation__style로 스타일 필터링
        qs = RecommendationBookmark.objects.filter(user_id=user_id, recommendation__style=style).select_related('recommendation')

        # 직렬화 후 응답
        serializer = RecommendationBookmarkSerializer(qs, many=True)
        return Response(serializer.data)

class MainRecommendBookmarkByTimeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('user_id', openapi.IN_QUERY, description='사용자 ID', type=openapi.TYPE_INTEGER, required=True),
            openapi.Parameter('order', openapi.IN_QUERY, description='정렬 (newest 또는 oldest)', type=openapi.TYPE_STRING, required=False),
        ]
    )
    def get(self, request):
        user_id = request.query_params.get("user_id")
        order = request.query_params.get("order", "newest")
        
        if not user_id:
            return Response(
                {"detail": "user_id 필요"}, status=status.HTTP_400_BAD_REQUEST
            )
        
        # MainRecommendationBookmark에서 필터링하여 가져옵니다.
        qs = MainRecommendationBookmark.objects.filter(user_id=user_id).select_related('main_recommendation')
        
        # 정렬 방식 처리 (newest 또는 oldest)
        if order == 'newest':
            qs = qs.order_by('-created_at')
        else:
            qs = qs.order_by('created_at')

        # 직렬화 후 응답
        serializer = MainRecommendationBookmarkSerializer(qs, many=True)
        return Response(serializer.data)

class MainRecommendBookmarkByPriceAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('user_id', openapi.IN_QUERY, description='사용자 ID', type=openapi.TYPE_INTEGER, required=True),
            openapi.Parameter('sort', openapi.IN_QUERY, description='정렬 (high 또는 low)', type=openapi.TYPE_STRING, required=True)
        ]
    )
    def get(self, request):
        user_id = request.query_params.get("user_id")
        sort = request.query_params.get("sort")
        if not user_id or sort not in ["high", "low"]:
            return Response(
                {"detail": "user_id 및 sort(high/low) 필요"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # MainRecommendationBookmark에서 user_id로 필터링하여 관련 데이터를 가져옵니다.
        qs = MainRecommendationBookmark.objects.filter(user_id=user_id).select_related('main_recommendation')

        # 'high'로 정렬하면 total_price가 높은 순서대로, 'low'로 정렬하면 낮은 순서대로 정렬
        if sort == 'high':
            qs = qs.order_by('-main_recommendation__total_price')
        else:
            qs = qs.order_by('main_recommendation__total_price')

        # 직렬화 후 응답
        serializer = MainRecommendationBookmarkSerializer(qs, many=True)
        return Response(serializer.data)

class MainRecommendBookmarkByStyleAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                "user_id",
                openapi.IN_QUERY,
                description="사용자 ID",
                type=openapi.TYPE_INTEGER,
                required=True,
            ),
            openapi.Parameter(
                "style",
                openapi.IN_QUERY,
                description="스타일 (미니멀 또는 캐주얼)",
                type=openapi.TYPE_STRING,
                required=True,
            ),
        ]
    )
    def get(self, request):
        user_id = request.query_params.get('user_id')
        style = request.query_params.get('style')
        if not user_id or style not in ['미니멀', '캐주얼']:
            return Response({"detail": "user_id 및 style(미니멀/캐주얼) 필요"}, status=status.HTTP_400_BAD_REQUEST)

        # MainRecommendationBookmark에서 스타일로 필터링하여 관련 데이터를 가져옵니다.
        qs = MainRecommendationBookmark.objects.filter(user_id=user_id, main_recommendation__style=style).select_related('main_recommendation')

        # 직렬화 후 응답
        serializer = MainRecommendationBookmarkSerializer(qs, many=True)
        return Response(serializer.data)
    
class RecommendationDetailView(RetrieveAPIView):
    queryset = Recommendation.objects.select_related('top', 'bottom', 'outer', 'shoes', 'user')
    serializer_class = RecommendationSerializer

class MainRecommendationDetailView(RetrieveAPIView):
    queryset = MainRecommendation.objects.select_related('top', 'bottom', 'outer', 'shoes')
    serializer_class = MainRecommendationSerializer