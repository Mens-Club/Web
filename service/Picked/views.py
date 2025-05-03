# Picked/views.py
from rest_framework import status
from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import RecommendationTest
from .serializers import RecommendationTestSerializer

# Swagger parameter decorators
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class RecommendationTestViewSet(ViewSet):
    serializer_class = RecommendationTestSerializer

    def get_base_queryset(self, request, require_user=False):
        qs = RecommendationTest.objects.filter(liked=True)
        user_id = request.query_params.get('user_id')
        if require_user or user_id:
            qs = qs.filter(user_id=user_id)
        return qs

    @swagger_auto_schema(auto_schema=None)
    def list(self, request, *args, **kwargs):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    @swagger_auto_schema(auto_schema=None)
    def retrieve(self, request, pk=None):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('bracket', openapi.IN_QUERY, '기준 금액 (콤마 구분)', type=openapi.TYPE_STRING),
            openapi.Parameter('per', openapi.IN_QUERY, '구간당 개수', type=openapi.TYPE_INTEGER),
            openapi.Parameter('user_id', openapi.IN_QUERY, '사용자 ID', type=openapi.TYPE_INTEGER),
            openapi.Parameter('sort', openapi.IN_QUERY, '마이: 가격 정렬 옵션 (high 또는 low)', type=openapi.TYPE_STRING),
        ]
    )
    @action(detail=False, methods=['get'])
    def price(self, request):
        brackets = request.query_params.get('bracket', '100000,200000,300000')
        per = int(request.query_params.get('per', 3))
        user_id = request.query_params.get('user_id')
        bracket_values = [int(x) for x in brackets.split(',') if x.isdigit()]
        base_qs = self.get_base_queryset(request)
        data = {}   
        if user_id:
            sort = request.query_params.get('sort')
            if not sort or sort not in ('high', 'low'):
                return Response({"detail": "sort 파라미터 필요 (high or low)"}, status=status.HTTP_400_BAD_REQUEST)
            qs = base_qs.filter(user_id=user_id)
            qs = qs.order_by('-total_price') if sort == 'high' else qs.order_by('total_price')
            return Response(self.serializer_class(qs, many=True).data)
        
            # base_qs = base_qs.filter(user_id=user_id)
            # # 마이 페이지: 전체 반환
            # for b in bracket_values:
            #     lower, upper = b, b + 100000
            #     qs = base_qs.filter(total_price__gte=lower, total_price__lt=upper)
            #     data[f"{b//10000}만원대"] = self.serializer_class(qs, many=True).data
        else:
            # 메인 페이지: 랜덤 샘플 per개
            for b in bracket_values:
                lower, upper = b, b + 100000
                qs = base_qs.filter(total_price__gte=lower, total_price__lt=upper).order_by('?')[:per]
                data[f"{b//10000}만원대"] = self.serializer_class(qs, many=True).data
        return Response(data)

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('style', openapi.IN_QUERY, '스타일명', type=openapi.TYPE_STRING, required=True),
            openapi.Parameter('per', openapi.IN_QUERY, '추출 개수', type=openapi.TYPE_INTEGER),
            openapi.Parameter('user_id', openapi.IN_QUERY, '사용자 ID', type=openapi.TYPE_INTEGER),
        ]
    )
    @action(detail=False, methods=['get'])
    def style(self, request):
        style = request.query_params.get('style')
        per = int(request.query_params.get('per', 3))
        user_id = request.query_params.get('user_id')
        if not style:
            return Response({"detail": "style 파라미터 필요"}, status=400)
        base_qs = self.get_base_queryset(request)

        if user_id:
            qs = base_qs.filter(style=style)
            my_qs = qs.filter(user_id=user_id)
            return Response(self.serializer_class(my_qs, many=True).data)
        else:
            qs = base_qs.filter(style=style).order_by('?')[:per]
            return Response(self.serializer_class(qs, many=True).data)
        
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('user_id', openapi.IN_QUERY, '사용자 ID', type=openapi.TYPE_INTEGER, required=True),
        ]
    )
    @action(detail=False, methods=['get'])
    def newest(self, request):
        qs = self.get_base_queryset(request, require_user=True).order_by('-created_at')
        return Response(self.serializer_class(qs, many=True).data)

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('user_id', openapi.IN_QUERY, '사용자 ID', type=openapi.TYPE_INTEGER, required=True),
        ]
    )
    @action(detail=False, methods=['get'])
    def oldest(self, request):
        qs = self.get_base_queryset(request, require_user=True).order_by('created_at')
        return Response(self.serializer_class(qs, many=True).data)

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('count', openapi.IN_QUERY, '추출 개수', type=openapi.TYPE_INTEGER),
        ]
    )
    @action(detail=False, methods=['get'])
    def random(self, request):
        count = int(request.query_params.get('count', 3))
        qs = self.get_base_queryset(request).order_by('?')[:count]
        return Response(self.serializer_class(qs, many=True).data)
