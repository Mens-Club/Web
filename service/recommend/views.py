from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.permissions import AllowAny

import requests
import base64
import json

from .RAG.encoding_elements import Encoding
from .RAG.rag_context_generator import create_rag_context

from .connect.connect_to_database import PGVecProcess

from .main.recommendation_item import get_recommendation
from .main.categorical_data import COLOR_PALETTE_BY_SEASON
from .main.recommendation_filter import filter_recommendation_by_season
from .main.product_search import search_items_by_category
from .main.combination_generator import generate_proper_combinations
from .main.season_extractor import extract_season_from_text


class IntegratedFashionRecommendAPIView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="이미지 URL을 기반으로 패션 추천 및 구체적인 상품 제안",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["image_url"],
            properties={
                "image_url": openapi.Schema(type=openapi.TYPE_STRING),
                "top_k": openapi.Schema(type=openapi.TYPE_INTEGER, default=5),
            },
        ),
        responses={200: "추천 성공", 400: "이미지 처리 오류", 500: "서버 오류"},
    )
    def post(self, request):
        try:
            image_url = request.data.get("image_url")
            top_k = request.data.get("top_k", 5)  # 기본값 5로 설정

            if not image_url:
                return Response(
                    {"status": "error", "message": "image_url은 필수 항목입니다"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # 1. 이미지 다운로드
            try:
                response = requests.get(image_url, timeout=10)
                response.raise_for_status()
                base64_image = base64.b64encode(response.content).decode("utf-8")
            except requests.RequestException as e:
                return Response(
                    {
                        "status": "error",
                        "message": f"이미지 다운로드에 실패했습니다: {str(e)}",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # 2. 임베딩용 이미지 처리
            encoder = Encoding()
            embedding = encoder.encode_image(image_url=image_url)

            if embedding is None:
                return Response(
                    {"status": "error", "message": "이미지 인코딩에 실패했습니다"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # 3. 유사 아이템 검색
            db_processor = PGVecProcess()
            cursor = db_processor.connect()

            if cursor is None:
                return Response(
                    {"status": "error", "message": "데이터베이스 연결에 실패했습니다"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            try:
                similar_items = db_processor.similarity_search(embedding, cursor, top_k)
            finally:
                cursor.close()
                db_processor.close()

            # 4. 가장 유사한 아이템 하나만 선택
            most_similar_item = similar_items[0] if similar_items else None

            if not most_similar_item:
                return Response(
                    {"status": "error", "message": "유사한 아이템을 찾을 수 없습니다"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # 5. RAG context 생성 (모듈화된 함수 사용)
            rag_context = create_rag_context(most_similar_item)
            print(rag_context)

            # 6. 추천 생성 (모듈화된 함수 사용)
            recommendation_result = get_recommendation(base64_image, rag_context)

            if not recommendation_result:
                return Response(
                    {"status": "error", "message": "추천 생성에 실패했습니다"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            # 7. JSON 파싱
            recommendation_json = json.loads(
                recommendation_result["generated_text"].split("assistant")[-1]
            )

            # 8. 계절 정보 추출 (모듈화된 함수 사용)
            answer_text = recommendation_json.get("answer", "")
            season = extract_season_from_text(answer_text)

            # 9. 계절별 허용된 카테고리로 필터링
            filtered_recommendation = filter_recommendation_by_season(
                recommendation_json, season
            )

            # 10. Elasticsearch를 통한 구체적인 상품 검색
            recommend_json = filtered_recommendation.get("recommend", {})

            # 11. 고정된 스타일 목록 사용
            styles = ["미니멀", "캐주얼"]

            # 12. 각 카테고리별 아이템 검색
            color_palette = COLOR_PALETTE_BY_SEASON.get(season, [])
            all_items = search_items_by_category(
                recommend_json, season, color_palette, styles
            )

            # 13. 조합 생성
            combinations = generate_proper_combinations(
                recommend_json, all_items, styles
            )

            # 최종 응답
            return Response(
                {
                    "status": "success",
                    "initial_recommendation": filtered_recommendation,
                    "detected_season": season,
                    "product_combinations": combinations,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"status": "error", "message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
