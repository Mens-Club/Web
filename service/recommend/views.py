from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.permissions import AllowAny
from elasticsearch import Elasticsearch
from django.conf import settings
import requests
import time
import base64
import json
import os
from .encoding_elements import Encoding
from .connect_to_database import PGVecProcess

# 계절별 추천 색상 팔레트
COLOR_PALETTE_BY_SEASON = {
    "봄": ['오트밀', '아이보리', '화이트', '블랙', '베이지', '네이비', "흑청", "진청", "연청", "중청"],
    "여름": ['스카이블루', '네이비', '화이트', '블랙', "연청", "중청", "흑청"],
    "가을": ['화이트', '블랙', '버건디', '오트밀', '아이보리', '카키', '베이지', '브라운', "흑청", "진청", "중청"],
    "겨울": ['화이트', '그레이', '블랙', '네이비', '카키', "흑청", "진청", "중청"]
}

# Elasticsearch 연결
es = Elasticsearch(settings.ELASTICSEARCH_URL)

class IntegratedFashionRecommendAPIView(APIView):
    permission_classes = [AllowAny]
    
    @swagger_auto_schema(
        operation_description="이미지 URL을 기반으로 패션 추천 및 구체적인 상품 제안",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["image_url"],
            properties={
                "image_url": openapi.Schema(type=openapi.TYPE_STRING),
                "top_k": openapi.Schema(type=openapi.TYPE_INTEGER, default=5)
            }
        ),
        responses={
            200: "추천 성공", 
            400: "이미지 처리 오류", 
            500: "서버 오류"
        },
    )
    def post(self, request):
        try:
            image_url = request.data.get('image_url')
            top_k = request.data.get('top_k', 5)  # 기본값 5로 설정
            
            if not image_url:
                return Response({
                    'status': 'error',
                    'message': 'image_url은 필수 항목입니다'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 1. 이미지 다운로드
            try:
                response = requests.get(image_url, timeout=10)
                response.raise_for_status()
                base64_image = base64.b64encode(response.content).decode('utf-8')
            except requests.RequestException as e:
                return Response({
                    'status': 'error',
                    'message': f'이미지 다운로드에 실패했습니다: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)
                
            # 2. 임베딩용 이미지 처리
            encoder = Encoding()
            embedding = encoder.encode_image(image_url=image_url)
            
            if embedding is None:
                return Response({
                    'status': 'error',
                    'message': '이미지 인코딩에 실패했습니다'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 3. 유사 아이템 검색
            db_processor = PGVecProcess()
            cursor = db_processor.connect()
            
            if cursor is None:
                return Response({
                    'status': 'error',
                    'message': '데이터베이스 연결에 실패했습니다'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            try:
                similar_items = db_processor.similarity_search(embedding, cursor, top_k)
            finally:
                cursor.close()
                db_processor.close()
            
            # 4. 가장 유사한 아이템 하나만 선택
            most_similar_item = similar_items[0] if similar_items else None
            
            if not most_similar_item:
                return Response({
                    'status': 'error',
                    'message': '유사한 아이템을 찾을 수 없습니다'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # 5. RAG context 생성
            rag_context = self._create_rag_context(most_similar_item)
            
            # 6. 추천 생성 (RunPod API 호출)
            recommendation_result = self._get_recommendation(base64_image, rag_context)
            
            if not recommendation_result:
                return Response({
                    'status': 'error',
                    'message': '추천 생성에 실패했습니다'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
            # 7. JSON 파싱
            recommendation_json = json.loads(recommendation_result["generated_text"].split("assistant")[-1])
            
            # 8. 계절 정보 추출 (answer에서 계절 키워드 찾기)
            answer_text = recommendation_json.get("answer", "")
            season = None
            for possible_season in ["봄", "여름", "가을", "겨울"]:
                if possible_season in answer_text:
                    season = possible_season
                    break
                    
            if not season:
                # 계절을 찾지 못했다면 기본값으로 '봄' 설정
                season = "봄"
                
            # 9. Elasticsearch를 통한 구체적인 상품 검색
            recommend_json = recommendation_json.get("recommend", {})
            
            # 10. 고정된 스타일 목록 사용 (원래 코드와 동일하게)
            styles = ["미니멀", "캐주얼"]
            
            # 11. 각 카테고리별 아이템 검색
            all_items = {"상의": {}, "하의": {}, "아우터": {}, "신발": {}}
            color_palette = COLOR_PALETTE_BY_SEASON.get(season, [])
            
            # 12. 각 카테고리와 서브카테고리별로 상품 검색
            self._search_items_by_category(recommend_json, season, color_palette, styles, all_items)
            
            # 13. 조합 생성
            combinations = self._generate_proper_combinations(recommend_json, all_items, styles)
            
            # 최종 응답
            return Response({
                'status': 'success',
                'initial_recommendation': recommendation_json,
                'detected_season': season,
                'product_combinations': combinations,
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({ 
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _create_rag_context(self, item):
        """가장 유사한 아이템으로 RAG context 생성"""
        context = []
        
        # 기본 정보
        context.append(f"카테고리: {item.get('category', '')}")
        context.append(f"서브카테고리: {item.get('sub_category', '')}")
        context.append(f"답변 내용: {item.get('answer', '')}")
        context.append(f"계절: {item.get('season', '')}")
        context.append(f"추천 내용: {item.get('recommend', '')}")
        
        # 추천 정보
        recommend_data = item.get('recommend', {})
        if recommend_data:
            for category, items in recommend_data.items():
                if items:
                    context.append(f"{category}: {', '.join(items[:3])}")
        
        return "\n".join(context)
    
    def _get_recommendation(self, base64_image, rag_context):
        """RunPod API를 통해 추천 생성"""
        api_key = os.getenv('RUNPOD_API_KEY')
        api_id = os.getenv('RUNPOD_ENDPOINT_ID')
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}'
        }
        
        prompt = f"""
        당신은 패션 추천 전문가입니다. 아래 이미지를 보고 판단하여 적절한 코디를 JSON 형식으로 추천해주세요.

        다음 참고 가이드라인을 고려하여 코디를 제안해주세요:
        {rag_context}

        이미지를 참고하여 다음 형식에 맞게 추천해주세요:
        {{ "answer": ..., "recommend": {{ "상의": [...], "아우터": [...], "하의": [...], "신발": [...] }} }}

        *주의*:
        1) `answer` 문장에 반드시 '해당 상품은 데님 팬츠로 보이며 봄에 잘 어울리는 스타일입니다'처럼 계절과 아이템 카테고리를 언급할 것.
        2) `recommend` 내 각 카테고리별로 최소 3개의 아이템을 제시할 것.
        3) 이미지에 등장하는 주요 아이템은 해당 카테고리에서 제외하고, 나머지 카테고리는 모두 추천할 것.
        4) `season`, `sub_category`, `main_category` 요소들은 recommend에 추가하지 말아야합니다.
        """
        
        payload = {
            'input': {
                "image_base64": base64_image,
                "rag_context": rag_context,
                "prompt": prompt,
                "temperature": 0.7,
                "max_tokens": 512
            }
        }
        
        url = f"https://api.runpod.ai/v2/{api_id}/run"
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code == 200:
            result = response.json()
                        
            # 동기 요청
            if "output" in result:
                return result["output"]
            
            # 비동기 요청
            elif "id" in result:
                task_id = result["id"]
                status_url = f"https://api.runpod.ai/v2/{api_id}/status/{task_id}"
                
                while True:
                    status_response = requests.get(status_url, headers=headers)
                    status_data = status_response.json()
                    
                    if status_data["status"] == "COMPLETED":
                        return status_data["output"]
                    elif status_data["status"] in ["FAILED", "CANCELLED"]:
                        raise Exception(f"Task {status_data['status']}")
                    
                    time.sleep(2)
        else:
            raise Exception(f"API 요청 실패: {response.status_code}")
    
    def _search_items_by_category(self, recommend_json, season, color_palette, styles, all_items):
        """각 카테고리별 아이템 검색"""
        for category, subcategories in recommend_json.items():
            if season == "여름" and category == "아우터":
                continue  # 여름에는 아우터 추천 안 함
                
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
                
                if hits:
                    all_items[category].setdefault(sub, []).extend([hit["_source"] for hit in hits])
    
    def _generate_proper_combinations(self, recommend_json, items_by_category, styles, max_count=3):
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