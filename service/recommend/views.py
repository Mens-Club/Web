from rest_framework.views import APIView
from rest_framework.response import Response
from django.forms.models import model_to_dict

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.permissions import AllowAny

import logging
import requests
import base64
import json

from .RAG.clip_loader import clip_model_instance
from .RAG.rag_context_generator import create_rag_context

from .connect.connect_to_database import PGVecProcess

from .main.recommendation_item import get_recommendation
from .main.categorical_data import COLOR_PALETTE_BY_SEASON
from .main.recommendation_filter import filter_recommendation_by_season
from .main.product_search import search_items_by_category
from .main.combination_generator import generate_proper_combinations
from .main.season_extractor import extract_season_from_text

# from .openai.utils import generate_reasoning_task
from .models import Recommendation

logger = logging.getLogger(__name__)


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
            logger.info("추천 요청 수신")
            image_url = request.data.get('image_url')
            top_k = request.data.get('top_k', 5)

            if not image_url:
                logger.warning("image_url 누락")
                return Response({'status': 'error', 'message': 'image_url은 필수 항목입니다'}, status=400)

            logger.info("STEP 1: 이미지 다운로드 시작")
            try:
                response = requests.get(image_url, timeout=10)
                response.raise_for_status()
                base64_image = base64.b64encode(response.content).decode('utf-8')
            except requests.RequestException as e:
                logger.error("이미지 다운로드 실패: %s", str(e))
                return Response({'status': 'error', 'message': f'이미지 다운로드에 실패했습니다: {str(e)}'}, status=400)

            logger.info("STEP 2: 이미지 임베딩 시작")
            embedding = clip_model_instance.encode_image(image_url=image_url)
            if embedding is None:
                logger.error("임베딩 실패")
                return Response({'status': 'error', 'message': '이미지 인코딩에 실패했습니다'}, status=400)

            logger.info("STEP 3: PGVector 유사 검색")
            db_processor = PGVecProcess()
            cursor = db_processor.connect()
            if cursor is None:
                logger.error("PGVector DB 연결 실패")
                return Response({'status': 'error', 'message': '데이터베이스 연결에 실패했습니다'}, status=500)

            try:
                similar_items = db_processor.similarity_search(embedding, cursor, top_k)
            finally:
                cursor.close()
                db_processor.close()

            most_similar_item = similar_items[0] if similar_items else None
            if not most_similar_item:
                logger.warning("유사 아이템 없음")
                return Response({'status': 'error', 'message': '유사한 아이템을 찾을 수 없습니다'}, status=404)

            logger.info("STEP 5: RAG Context 생성")
            rag_context = create_rag_context(most_similar_item)

            logger.info("STEP 6: 추천 생성 시작")
            recommendation_result = get_recommendation(base64_image, rag_context)
            logger.debug("추천 원시 결과: %s", recommendation_result)

            if not recommendation_result:
                logger.error("추천 생성 실패")
                return Response({'status': 'error', 'message': '추천 생성에 실패했습니다'}, status=500)

            logger.info("STEP 7: 추천 JSON 파싱")
            try:
                raw_output = recommendation_result.get("generated_text", "")
                parsed_json_text = raw_output.split("assistant")[-1].strip()
                recommendation_json = json.loads(parsed_json_text)
            except Exception as e:
                logger.error("❌ JSON 파싱 실패: %s", str(e))
                logger.debug("🔍 파싱 실패 원본: %s", raw_output)
                return Response({
                    'status': 'error',
                    'message': f"추천 JSON 파싱 실패: {str(e)}",
                    'raw_output': raw_output
                }, status=500)

            logger.info("STEP 8: 계절 추출")
            answer_text = recommendation_json.get("answer", "")
            season = extract_season_from_text(answer_text)

            logger.info("STEP 9: 계절 필터링 적용")
            filtered_recommendation = filter_recommendation_by_season(recommendation_json, season)

            logger.info("STEP 10: 상품 검색 시작")
            recommend_json = filtered_recommendation.get("recommend", {})
            styles = ["미니멀", "캐주얼"]
            color_palette = COLOR_PALETTE_BY_SEASON.get(season, [])
            
            all_items = search_items_by_category(recommend_json, season, color_palette, styles)
            logger.debug("STEP 10 결과 all_items: %s", all_items)
            
            logger.info("STEP 11: 조합 생성")
            combinations = generate_proper_combinations(recommend_json, all_items, styles)
            logger.debug("STEP 11 결과 조합들: %s", combinations)
            recommendation_outputs = []

            for idx, combo in enumerate(combinations):
                if combo is None:
                    logger.warning(f"STEP 11-1: 조합 #{idx}가 None입니다. 건너뜁니다.")
                    continue

                top = combo.get("상의")
                bottom = combo.get("하의")
                outer = combo.get("아우터")
                shoes = combo.get("신발")

                top_id = top.get("idx") if top else None
                bottom_id = bottom.get("idx") if bottom else None
                outer_id = outer.get("idx") if outer else None
                shoes_id = shoes.get("idx") if shoes else None

                total_price = sum([
                    int(top.get("price", 0)) if top else 0,
                    int(bottom.get("price", 0)) if bottom else 0,
                    int(outer.get("price", 0)) if outer else 0,
                    int(shoes.get("price", 0)) if shoes else 0,
                ])

                recommendation = Recommendation.objects.create(
                    user=request.user if request.user.is_authenticated else None,
                    top_id=top_id,
                    bottom_id=bottom_id,
                    outer_id=outer_id,
                    shoes_id=shoes_id,
                    answer=answer_text,
                    reasoning_text="",
                    total_price=total_price
                )
                
                recommendation_outputs.append({
                    "recommendation_code": recommendation.recommendation_code,
                    "combination": combo,
                    "total_price": total_price
                })

            # logger.info("STEP 12: Celery 비동기 reasoning 요청")
            # generate_reasoning_task.delay(
            #     recommendation_ids=recommendation_ids,
            #     combinations=combinations,
            #     season=season,
            #     styles=styles,
            #     original_item_info=similar_items[0]
            # )

            logger.info("추천 처리 완료")
            return Response({
                'status': 'success',
                'initial_recommendation': filtered_recommendation,
                'detected_season': season,
                'product_combinations': recommendation_outputs, 
            }, status=200)

        except Exception as e:
            
            logger.exception("처리 중 알 수 없는 예외 발생")
            return Response({'status': 'error', 'message': str(e)}, status=500)

class RecommendationDetailAPIView(APIView):
    @swagger_auto_schema(
        operation_description="recommendation_code로 Recommendation 객체의 모든 필드 값 조회",
        manual_parameters=[
            openapi.Parameter(
                'recommendation_code',
                openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                required=True,
                description="추천 코드"
            )
        ],
        responses={200: "조회 성공", 404: "데이터 없음", 400: "잘못된 요청"}
    )
    def get(self, request):
        code = request.query_params.get('recommendation_code')
        if not code:
            return Response({'status': 'error', 'message': 'recommendation_code는 필수입니다.'}, status=400)

        try:
            recommendation = Recommendation.objects.get(recommendation_code=code)
            data = model_to_dict(recommendation)
            return Response({'status': 'success', 'data': data}, status=200)

        except Recommendation.DoesNotExist:
            return Response({'status': 'error', 'message': '추천 결과를 찾을 수 없습니다.'}, status=404)