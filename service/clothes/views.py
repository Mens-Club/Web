from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.response import Response
from elasticsearch import Elasticsearch
from django.conf import settings

from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.response import Response
from elasticsearch import Elasticsearch
from django.conf import settings

# 계절별 추천 색상 팔레트
COLOR_PALETTE_BY_SEASON = {
    "봄": ['오트밀', '아이보리', '화이트', '블랙', '베이지', '네이비', "흑청", "진청", "연청", "중청"],
    "여름": ['스카이블루', '네이비', '화이트', '블랙', "연청", "중청", "흑청"],
    "가을": ['화이트', '블랙', '버건디', '오트밀', '아이보리', '카키', '베이지', '브라운', "흑청", "진청", "중청"],
    "겨울": ['화이트', '그레이', '블랙', '네이비', '카키', "흑청", "진청", "중청"]
}

# Elasticsearch 연결
es = Elasticsearch(settings.ELASTICSEARCH_URL)

class OutfitRecommendView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="카테고리, 스타일, 계절 기반 코디 추천",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["recommend", "style", "season"],
            properties={
                "recommend": openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "상의": openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Items(type=openapi.TYPE_STRING)),
                        "하의": openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Items(type=openapi.TYPE_STRING)),
                        "아우터": openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Items(type=openapi.TYPE_STRING)),
                        "신발": openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Items(type=openapi.TYPE_STRING)),
                    }
                ),
                "style": openapi.Schema(type=openapi.TYPE_STRING, example="캐주얼"),
                "season": openapi.Schema(type=openapi.TYPE_STRING, example="봄"),
            }
        ),
        responses={200: "추천 성공", 400: "입력 오류"},
    )
    
    def post(self, request):
        data = request.data
        recommend_json = data.get("recommend")
        season = data.get("season")

        if not (recommend_json and season):
            return Response({"error": "recommend/season이 필요합니다."}, status=400)

        color_palette = COLOR_PALETTE_BY_SEASON.get(season, [])
        styles = ["미니멀", "캐주얼"]
        
        all_items = {"상의": {}, "하의": {}, "아우터": {}, "신발": {}}
        debug_info = {"color_palette": color_palette, "query_results": [], "styles_rotation": styles}

        for category, subcategories in recommend_json.items():
            if season == "여름" and category == "아우터":
                continue

            for sub in subcategories:
                if category == "신발":
                    # 신발은 스타일 조건 없이 검색
                    must_conditions = [
                        {"match_phrase": {"sub_category": sub}},
                        {"wildcard": {"season": f"*{season}*"}},
                        {"bool": {
                            "should": [
                                {"match": {"color": color}} for color in color_palette
                            ],
                            "minimum_should_match": 1
                        }}
                    ]
                else:
                    # 의류는 스타일별로 개별 검색
                    style_conditions = [{"match_phrase": {"style": style}} for style in styles]
                    
                    must_conditions = [
                        {"match_phrase": {"main_category": category}},
                        {"match_phrase": {"sub_category": sub}},
                        {"bool": {
                            "should": style_conditions,
                            "minimum_should_match": 1
                        }},
                        {"wildcard": {"season": f"*{season}*"}},
                        {"bool": {
                            "should": [
                                {"match": {"color": color}} for color in color_palette
                            ],
                            "minimum_should_match": 1
                        }}
                    ]

                query = {
                    "query": {
                        "bool": {
                            "must": must_conditions
                        }
                    },
                    "size": 10,  # 더 많은 결과 요청
                    "sort": [
                        {
                            "_script": {
                                "type": "number",
                                "script": "Math.random()",
                                "order": "asc"
                            }
                        }
                    ]
                }

                index_name = "shoes" if category == "신발" else "clothes"
                res = es.search(index=index_name, body=query)
                hits = res.get("hits", {}).get("hits", [])
                
                debug_info["query_results"].append({
                    "category": category,
                    "sub": sub,
                    "hits_count": len(hits),
                    "query": query
                })
                
                if hits:
                    all_items[category].setdefault(sub, []).extend([hit["_source"] for hit in hits])

        # 스타일별로 통일된 조합 생성
        combinations = self.generate_proper_combinations(recommend_json, all_items, styles)
        
        if settings.DEBUG:
            return Response({
                "combinations": combinations,
                "debug": debug_info,
                "all_items": all_items
            }, status=200)
        
        return Response({"combinations": combinations}, status=200)

    def generate_proper_combinations(self, recommend_json, items_by_category, styles, max_count=3):
        """각 조합이 요청된 서브카테고리를 순차적으로 사용"""
        combinations = []
        
        for combo_idx in range(max_count):
            current_style = styles[combo_idx % len(styles)]
            combo = {"상의": None, "하의": None, "아우터": None, "신발": None}
            
            for category, subcategories in recommend_json.items():
                if not subcategories:
                    continue
                    
                # combo_idx가 해당 카테고리의 서브카테고리 개수보다 작을 때만 선택
                if combo_idx < len(subcategories):
                    sub = subcategories[combo_idx]
                    
                    # 해당 서브카테고리의 아이템 찾기
                    if category == "신발":
                        items = items_by_category.get(category, {}).get(sub, [])
                        if items:
                            import random
                            combo[category] = random.choice(items)
                    else:
                        # 현재 스타일과 매칭
                        matching_items = []
                        if sub in items_by_category.get(category, {}):
                            for item in items_by_category[category][sub]:
                                if item.get("style") == current_style:
                                    matching_items.append(item)
                        
                        # 스타일 제한 없이 찾기
                        if not matching_items:
                            matching_items = items_by_category.get(category, {}).get(sub, [])
                        
                        if matching_items:
                            import random
                            combo[category] = random.choice(matching_items)
            
            combinations.append(combo)
        
        return combinations