from rest_framework.views import APIView
from rest_framework.response import Response

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.permissions import IsAuthenticated

import logging
import requests
import base64
import json
import time
import io
from PIL import Image


from .RAG.rag_context_generator import create_rag_context
from .RAG.encoding_clip import get_clip_embedding

from .connect.connect_to_database import PGVecProcess

from .main.recommendation_item import get_recommendation
from .main.categorical_data import COLOR_PALETTE_BY_SEASON, SEASONAL_REQUIRED_CATEGORIES, VALIDATION_SUB_CATEGORY, VALIDATION_MAIN_CATEGORIES, SEASON_COLABORATION_CATEGORY
from .main.recommendation_filter import filter_recommendation_by_season
from .main.product_search import search_items_by_category
from .main.combination_generator import generate_proper_combinations
from .main.season_extractor import extract_season_from_text
from .main.validate_answer_categories import validate_answer_categories

from .openai.utils import generate_reasoning_task
from .models import Recommendation
from .utils.metrics import push_fashion_recommendation_metrics, machine_log_metrics

from .serializers import RecommendationResultSerializer

logger = logging.getLogger(__name__)


class IntegratedFashionRecommendAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="이미지 URL을 기반으로 패션 추천 및 구체적인 상품 제안",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["image_url"],
            properties={
                "image_url": openapi.Schema(type=openapi.TYPE_STRING, format="uri"),
                "top_k": openapi.Schema(type=openapi.TYPE_INTEGER, default=5),
            },
        ),
            responses={
                200: openapi.Response(
                    description="추천 성공",
                    schema=RecommendationResultSerializer
                ),
                400: "이미지 처리 오류",
                500: "서버 오류"
            }
    )
    
    def post(self, request):
        start_time = time.time()  # 시간 측정용
        try:
            logger.info("추천 요청 수신")
            image_url = request.data.get("image_url")
            top_k = request.data.get("top_k", 5)

            if not image_url:
                logger.warning("image_url 누락")
                return Response(
                    {"status": "error", "message": "image_url은 필수 항목입니다"},
                    status=400,
                )

            logger.info("STEP 1: 이미지 다운로드 시작")
            try:
                # 이미지 다운로드
                response = requests.get(image_url, timeout=10)
                response.raise_for_status()  # 결과 보고

                base64_image = base64.b64encode(response.content).decode(
                    "utf-8"
                )  # RUNPOD Inference용
                pil_image = Image.open(io.BytesIO(response.content)).convert(
                    "RGB"
                )  # RAG용
            except requests.RequestException as e:
                logger.error("이미지 다운로드 실패: %s", str(e))
                return Response(
                    {
                        "status": "error",
                        "message": f"이미지 다운로드에 실패했습니다: {str(e)}",
                    },
                    status=400,
                )

            logger.info("STEP 2: 이미지 임베딩 시작")
            embedding = get_clip_embedding(pil_image=pil_image)
            logger.info(f"임베딩 결과 : \n {embedding}")
            if embedding is None:
                logger.error("임베딩 실패")
                return Response(
                    {"status": "error", "message": "이미지 인코딩에 실패했습니다"},
                    status=400,
                )

            logger.info("STEP 3: PGVector 유사 검색")
            db_processor = PGVecProcess()
            cursor = db_processor.connect()
            if cursor is None:
                logger.error("PGVector DB 연결 실패")
                return Response(
                    {"status": "error", "message": "데이터베이스 연결에 실패했습니다"},
                    status=500,
                )

            try:
                similar_items = db_processor.similarity_search(embedding, cursor, top_k)
            finally:
                cursor.close()
                db_processor.close()

            most_similar_item = similar_items[0] if similar_items else None
            if not most_similar_item:
                logger.warning("유사 아이템 없음")
                return Response(
                    {"status": "error", "message": "유사한 아이템을 찾을 수 없습니다"},
                    status=404,
                )

            logger.info("STEP 5: RAG Context 생성")
            rag_context = create_rag_context(most_similar_item)
            logging.debug("유사 컨텍스트 결과 %s", rag_context)

            logger.info("Ex. 카테고리 검증")
            try:
                rag_context_dict = json.loads(rag_context)
                expected_recommend = rag_context_dict.get("recommend", {})
            except Exception as e:
                logger.error("RAG Context JSON 파싱 실패: %s", str(e))
                expected_recommend = {}

            logger.info("STEP 6: 추천 생성 시작")
            recommendation_result = get_recommendation(base64_image, rag_context)
            logger.debug("추천 원시 결과: %s", recommendation_result)

            if not recommendation_result:
                logger.error("추천 생성 실패")
                return Response(
                    {"status": "error", "message": "추천 생성에 실패했습니다"},
                    status=500,
                )
            
            logger.info("STEP 7: 추천 JSON 파싱")
            try:
                raw_output = recommendation_result.get("generated_text", "")
                parsed_json_text = raw_output.split("assistant")[-1].strip()
                recommendation_json = json.loads(parsed_json_text)
            except Exception as e:
                logger.error("JSON 파싱 실패: %s", str(e))
                logger.debug("파싱 실패 원본: %s", raw_output)
                return Response(
                    {
                        "status": "error",
                        "message": f"추천 JSON 파싱 실패: {str(e)}",
                        "raw_output": raw_output,
                    },
                    status=500,
                )
                
            # 시리얼라이저 = 데이터 타입 검증
            logger.info("STEP 7-1: 데이터 타입 검증")
            serializer = RecommendationResultSerializer(data=recommendation_json)
            
            if not serializer.is_valid():
                logger.error("시리얼라이저 검증 실패: %s", serializer.errors)
                return Response(
                    {
                        "status": "error",
                        "message": "추천 데이터 형식이 올바르지 않습니다.",
                        "errors": serializer.errors
                    },
                    status=400,
                )

            logger.info("STEP 8: 계절 추출")
            answer_text = serializer.validated_data["answer"]
            season = extract_season_from_text(answer_text)
            
            matched_categories = validate_answer_categories(
                answer_text, VALIDATION_SUB_CATEGORY
            )
            
            # 입력 카테고리 제외하고 아이템 매칭 

            logger.info("STEP 8-1: 카테고리 검증")
            if not matched_categories:
                logger.warning("유효한 카테고리가 answer_text에 포함되지 않음")
                push_fashion_recommendation_metrics(
                    success=False, duration=time.time() - start_time
                )
                return Response(
                    {
                        "status": "error",
                        "message": "추천 결과에 유효한 카테고리가 포함되어 있지 않습니다. 재시도해주세요.",
                        "raw_answer": answer_text,
                    },
                    status=500,
                )
            

            logger.info("STEP 9: 계절 필터링 적용")
            filtered_recommendation = filter_recommendation_by_season(
                recommendation_json, season
            )

            logger.info("STEP 10: 입력된 카테고리 외 누락 검증")
            input_category = matched_categories[0]  # 예: "데님 팬츠"
            logger.info(f"감지된 서브 카테고리: {input_category}")

            # 서브 카테고리를 메인 카테고리로 매핑
            for season_data in SEASON_COLABORATION_CATEGORY.values():
                for main, subs in season_data.items():
                    if input_category in subs:
                        logger.info(f"서브 카테고리 '{input_category}'를 메인 카테고리 '{main}'으로 매핑")
                        input_category = main
                        break
                if input_category != matched_categories[0]:  # 이미 메인 카테고리를 찾았으면 루프 종료
                    break
                        
            logger.info(f"최종 사용 카테고리: {input_category}")
            
            recommend_json = filtered_recommendation.get("recommend", {})
            required_categories = SEASONAL_REQUIRED_CATEGORIES.get(season, VALIDATION_MAIN_CATEGORIES)
            
            # 입력 카테고리(메인 카테고리로 매핑된) 제외한 다른 필수 카테고리만 검증
            other_required_categories = [cat for cat in required_categories if cat != input_category]
            logger.info(f"입력 카테고리({input_category})를 제외한 필수 카테고리: {other_required_categories}")
            
            missing_required_main_categories = [
                cat for cat in other_required_categories
                if cat not in recommend_json or not recommend_json[cat]
            ]
            
            if missing_required_main_categories:
                logger.warning("입력값 외 필수 카테고리 누락: %s", missing_required_main_categories)
                push_fashion_recommendation_metrics(
                    success=False, duration=time.time() - start_time
                )
                return Response(
                    {
                        "status": "error",
                        "message": f"추천 결과에서 필수 카테고리({', '.join(missing_required_main_categories)})가 누락되었습니다. 다시 시도해주세요.",
                        "filtered_recommendation": recommend_json,
                    },
                    status=500,
                )
                
            # RAG Context 검증도 수정 - 입력 카테고리 제외
            missing_required = [
                category
                for category, expected_items in expected_recommend.items()
                if category != input_category and expected_items and not recommend_json.get(category)
            ]

            if missing_required:
                logger.warning("RAG 기준 필수 카테고리 누락됨: %s", missing_required)
                push_fashion_recommendation_metrics(
                success=False,
                duration=time.time() - start_time
                )
                return Response(
                    {
                        "status": "error",
                        "message": f"추천 결과에 필수 카테고리({', '.join(missing_required)})가 누락되어 조합을 생성할 수 없습니다.",
                        "filtered_recommendation": recommend_json,
                        "expected_from_rag": expected_recommend,
                    },
                    status=500,
                )

            styles = ["미니멀", "캐주얼"]
            color_palette = COLOR_PALETTE_BY_SEASON.get(season, [])

            all_items = search_items_by_category(
                recommend_json, season, color_palette, styles
            )
            logger.debug("STEP 10 결과 all_items: %s", all_items)

            logger.info("STEP 11: 조합 생성")
            combinations = generate_proper_combinations(
                recommend_json, all_items, styles
            )
            logger.debug("STEP 11 결과 조합들: %s", combinations)
            recommendation_outputs = []

            for id, combo in enumerate(combinations):
                if combo is None:
                    logger.warning(f"STEP 11-1: 조합 #{id}가 None입니다. 건너뜁니다.")
                    continue

                top = combo.get("상의")
                bottom = combo.get("하의")
                outer = combo.get("아우터")
                shoes = combo.get("신발")

                top_id = top.get("id") if top else None
                bottom_id = bottom.get("id") if bottom else None
                outer_id = outer.get("id") if outer else None
                shoes_id = shoes.get("id") if shoes else None
                items = [top, bottom, outer, shoes]
                style = next((item.get("style") for item in items if item and item.get("style")), "")


                total_price = sum(
                    [
                        int(top.get("price", 0)) if top else 0,
                        int(bottom.get("price", 0)) if bottom else 0,
                        int(outer.get("price", 0)) if outer else 0,
                        int(shoes.get("price", 0)) if shoes else 0,
                    ]
                )

                recommendation = Recommendation.objects.create(
                    user=request.user if request.user.is_authenticated else None,
                    top_id=top_id,
                    bottom_id=bottom_id,
                    outer_id=outer_id,
                    shoes_id=shoes_id,
                    answer=answer_text,
                    reasoning_text="",
                    style=style,
                    total_price=total_price,
                )

                recommendation_outputs.append(
                    {
                        "recommendation_id": recommendation.id,
                        "combination": combo,
                        "total_price": total_price,
                    }
                )

            logger.info("STEP 12: Celery 비동기 reasoning 요청")
            generate_reasoning_task.delay(
                recommendation_ids=[
                    r["recommendation_id"] for r in recommendation_outputs
                ],
                combinations=[r["combination"] for r in recommendation_outputs],
                season=season,
                styles=styles,
                original_item_info=similar_items[0],
            )

            logger.info("추천 처리 완료")

            # mlflow 로깅 트레이싱
            machine_log_metrics(
                image=pil_image,
                rag_context=rag_context,
                model_output=recommendation_json,
                tag="inference_result",
            )

            # 성공 매트릭 push
            push_fashion_recommendation_metrics(
                success=True, duration=time.time() - start_time
            )

            return Response(
                {
                    "status": "success",
                    "initial_recommendation": filtered_recommendation,
                    "detected_season": season,
                    "product_combinations": recommendation_outputs,
                },
                status=200,
            )

        except Exception as e:

            logger.exception("처리 중 알 수 없는 예외 발생")
            push_fashion_recommendation_metrics(
                success=False, duration=time.time() - start_time
            )
            return Response({"status": "error", "message": str(e)}, status=500)