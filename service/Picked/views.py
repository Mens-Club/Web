from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from django.core.cache import cache
from django.utils import timezone
from rest_framework import status
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
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

        try:
            bookmark = RecommendationBookmark.objects.get(user=user, recommendation=recommendation)
            bookmark.delete()

            # Redis 캐시 무효화
            cache.delete(f"bookmark_user_{user.id}_newest")
            cache.delete(f"bookmark_user_{user.id}_oldest")
            cache.delete(f"bookmark_user_{user.id}_price_high")
            cache.delete(f"bookmark_user_{user.id}_price_low")
            cache.delete(f"bookmark_user_{user.id}_style_미니멀")
            cache.delete(f"bookmark_user_{user.id}_style_캐주얼")
            print("Redis 캐시 삭제됨 (북마크 삭제됨)")

            return Response({
                "message": "Bookmark deleted.",
                "status": "deleted"
            }, status=status.HTTP_200_OK)

        except RecommendationBookmark.DoesNotExist:
            RecommendationBookmark.objects.create(
                user=user,
                recommendation=recommendation,
                created_at=timezone.now()
            )

            # Redis 캐시 무효화
            cache.delete(f"bookmark_user_{user.id}_newest")
            cache.delete(f"bookmark_user_{user.id}_oldest")
            cache.delete(f"bookmark_user_{user.id}_price_high")
            cache.delete(f"bookmark_user_{user.id}_price_low")
            cache.delete(f"bookmark_user_{user.id}_style_미니멀")
            cache.delete(f"bookmark_user_{user.id}_style_캐주얼")
            print("Redis 캐시 삭제됨 (북마크 생성됨)")

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

        try:
            bookmark = MainRecommendationBookmark.objects.get(user=user, main_recommendation=main_recommendation)
            # 북마크가 있으면 삭제
            bookmark.delete()

            # Redis 캐시 무효화
            cache.delete(f"mainbookmark_user_{user.id}_newest")
            cache.delete(f"mainbookmark_user_{user.id}_oldest")
            cache.delete(f"mainbookmark_user_{user.id}_price_high")
            cache.delete(f"mainbookmark_user_{user.id}_price_low")
            cache.delete(f"mainbookmark_user_{user.id}_style_미니멀")
            cache.delete(f"mainbookmark_user_{user.id}_style_캐주얼")

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

            # Redis 캐시 무효화
            cache.delete(f"mainbookmark_user_{user.id}_newest")
            cache.delete(f"mainbookmark_user_{user.id}_oldest")
            cache.delete(f"mainbookmark_user_{user.id}_price_high")
            cache.delete(f"mainbookmark_user_{user.id}_price_low")
            cache.delete(f"mainbookmark_user_{user.id}_style_미니멀")
            cache.delete(f"mainbookmark_user_{user.id}_style_캐주얼")

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
        count = int(request.query_params.get("count", 3))

        items = MainRecommendation.objects.order_by("?")[:count]
        serialized_data = MainRecommendationSerializer(items, many=True).data

        return Response(serialized_data)

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

        # 캐시 키 생성
        cache_key = f"bookmark_user_{user_id}_{order}"
        cached_data = cache.get(cache_key)
        if cached_data:
            print("✅ From Redis")
            return Response(cached_data)

        # DB 조회
        qs = RecommendationBookmark.objects.filter(
            user_id=user_id
        ).select_related('recommendation')

        if order == 'newest':
            qs = qs.order_by('-created_at')
        else:
            qs = qs.order_by('created_at')

        serializer = RecommendationBookmarkSerializer(qs, many=True)
        data = serializer.data

        # Redis에 저장 (TTL: 5분)
        cache.set(cache_key, data, timeout=300)
        return Response(data)

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

        # 캐시 키 생성
        cache_key = f"bookmark_user_{user_id}_price_{sort}"
        cached_data = cache.get(cache_key)
        if cached_data:
            print(f"✅ From Redis")
            return Response(cached_data)

        # 북마크 데이터 쿼리
        qs = RecommendationBookmark.objects.filter(user_id=user_id).select_related('recommendation')

        if sort == 'high':
            qs = qs.order_by('-recommendation__total_price')
        else:
            qs = qs.order_by('recommendation__total_price')

        serializer = RecommendationBookmarkSerializer(qs, many=True)

        # 캐시 저장
        cache.set(cache_key, serializer.data, timeout=60 * 5)

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
        
        if not user_id or style not in ['미니멀', '캐주얼']:
            return Response({"detail": "user_id 및 style(미니멀/캐주얼) 필요"}, status=status.HTTP_400_BAD_REQUEST)

        cache_key = f"bookmark_user_{user_id}_style_{style}"
        cached_data = cache.get(cache_key)
        if cached_data:
            print("✅ From Redis")
            return Response(cached_data)

        qs = RecommendationBookmark.objects.filter(
            user_id=user_id,
            recommendation__style=style
        ).select_related('recommendation')

        serializer = RecommendationBookmarkSerializer(qs, many=True)
        cache.set(cache_key, serializer.data, timeout=60 * 5)  # 5분 캐시

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

        cache_key = f"mainbookmark_user_{user_id}_{order}"
        cached_data = cache.get(cache_key)
        if cached_data:
            print(f"From Redis")
            return Response(cached_data)

        qs = MainRecommendationBookmark.objects.filter(user_id=user_id).select_related('main_recommendation')

        if order == 'newest':
            qs = qs.order_by('-created_at')
        else:
            qs = qs.order_by('created_at')

        serializer = MainRecommendationBookmarkSerializer(qs, many=True)

        # Redis 캐시에 5분간 저장
        cache.set(cache_key, serializer.data, timeout=60 * 5)

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

        cache_key = f"mainbookmark_user_{user_id}_price_{sort}"
        cached_data = cache.get(cache_key)
        if cached_data:
            print(f"✅ From Redis")
            return Response(cached_data)

        qs = MainRecommendationBookmark.objects.filter(user_id=user_id).select_related('main_recommendation')

        if sort == 'high':
            qs = qs.order_by('-main_recommendation__total_price')
        else:
            qs = qs.order_by('main_recommendation__total_price')

        serializer = MainRecommendationBookmarkSerializer(qs, many=True)

        cache.set(cache_key, serializer.data, timeout=60 * 5)

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

        cache_key = f"mainbookmark_user_{user_id}_style_{style}"
        cached_data = cache.get(cache_key)
        if cached_data:
            print(f"✅ From Redis")
            return Response(cached_data)

        qs = MainRecommendationBookmark.objects.filter(
            user_id=user_id, main_recommendation__style=style
        ).select_related('main_recommendation')

        serializer = MainRecommendationBookmarkSerializer(qs, many=True)

        cache.set(cache_key, serializer.data, timeout=60 * 5)

        return Response(serializer.data)
    
class RecommendationDetailView(RetrieveAPIView):
    queryset = Recommendation.objects.select_related('top', 'bottom', 'outer', 'shoes', 'user')
    serializer_class = RecommendationSerializer

class MainRecommendationDetailView(RetrieveAPIView):
    queryset = MainRecommendation.objects.select_related('top', 'bottom', 'outer', 'shoes')
    serializer_class = MainRecommendationSerializer