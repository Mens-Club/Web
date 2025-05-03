from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import RecommendationTest
from .serializers import RecommendationTestSerializer

class RecommendationTestViewSet(viewsets.ReadOnlyModelViewSet):
    """
    liked=1 레코드 기본 queryset.
    추가로 ?user_id= 를 붙이면 해당 사용자 필터가 적용됩니다.
    """
    serializer_class = RecommendationTestSerializer

    def get_queryset(self):
        qs = RecommendationTest.objects.filter(liked=True)
        user_id = self.request.query_params.get('user_id')
        if user_id:
            qs = qs.filter(user_id=user_id)
        return qs

    @action(detail=False, methods=['get'])
    def random(self, request):
        qs = self.get_queryset().order_by('?')
        return Response(self.get_serializer(qs, many=True).data)

    @action(detail=False, methods=['get'])
    def by_price_bracket(self, request):
        """
        price_brackets: 콤마로 구분된 기준가 (예: 100000,200000,300000)
        per_bracket: 각 구간당 추출 개수 (디폴트 3)
        """
        brackets = request.query_params.get('price_brackets', '100000,200000,300000')
        per_bracket = int(request.query_params.get('per_bracket', 3))
        # 문자열 → 정수 리스트
        bracket_values = [int(x) for x in brackets.split(',') if x.isdigit()]
        
        result = {}
        base_qs = self.get_queryset()
        
        for b in bracket_values:
            lower = b
            upper = b + 100000
            # 해당 가격대 필터, liked 및 user_id 필터는 get_queryset()으로 이미 적용됨
            qs = base_qs.filter(total_price__gte=lower, total_price__lt=upper)[:per_bracket]
            result[f"{b // 10000}0만원대"] = self.get_serializer(qs, many=True).data

        return Response(result)

    @action(detail=False, methods=['get'])
    def by_style(self, request):
        order = request.query_params.get('order', 'asc')
        sort_field = 'style' if order == 'asc' else '-style'
        qs = self.get_queryset().order_by(sort_field)
        return Response(self.get_serializer(qs, many=True).data)

    @action(detail=False, methods=['get'])
    def newest(self, request):
        qs = self.get_queryset().order_by('-created_at')
        return Response(self.get_serializer(qs, many=True).data)

    @action(detail=False, methods=['get'])
    def oldest(self, request):
        qs = self.get_queryset().order_by('created_at')
        return Response(self.get_serializer(qs, many=True).data)