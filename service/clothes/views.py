from rest_framework.views import APIView
from rest_framework.response import Response
from .models import MensTable, ShoesTest, Base64FileTest, PickedClothesTest, DroppedClothes
from rest_framework.permissions import AllowAny
from drf_yasg.utils import swagger_auto_schema
from .serializers import RecommendedGoodsRequestSerializer, SaveImageRequestSerializer, CancelLikeSerializer
import re
from drf_yasg import openapi

class RecommendedGoodsView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(request_body=RecommendedGoodsRequestSerializer)
    def post(self, request):
        serializer = RecommendedGoodsRequestSerializer(data=request.data)
        
        if serializer.is_valid():
            top = serializer.validated_data['top']
            outwear = serializer.validated_data['outwear']
            bottom = serializer.validated_data['bottom']
            shoes = serializer.validated_data['shoes']

            # menstable_test에서 가져오기
            top_goods = MensTable.objects.filter(sub_category=top).order_by('?').first()
            outwear_goods = MensTable.objects.filter(sub_category=outwear).order_by('?').first()
            bottom_goods = MensTable.objects.filter(sub_category=bottom).order_by('?').first()

            # shoes_test에서 가져오기
            shoes_goods = ShoesTest.objects.filter(sub_category=shoes).order_by('?').first()

            def generate_image_url(goods_url, is_shoes=False):
                """ goods_url에서 숫자만 추출해 변환된 이미지 URL을 생성 """
                match = re.search(r'/products/(\d+)', goods_url)
                if match:
                    if is_shoes:
                        product_id = match.group(1)
                        return f"https://kr.object.iwinv.kr/web-assets-prod/shoes/{product_id}.jpg"
                    else:
                        product_id = match.group(1)
                        return f"https://kr.object.iwinv.kr/web-assets-prod/clothes/{product_id}.jpg"
                return None

            # 결과 만들기
            result = {
                "top": [],
                "outwear": [],
                "bottom": [],
                "shoes": []
            }

            if top_goods:
                result["top"].append({
                    "goods_name": top_goods.goods_name,
                    "sub_category": top_goods.sub_category,
                    "image_url": generate_image_url(top_goods.goods_url)
                })

            if outwear_goods:
                result["outwear"].append({
                    "goods_name": outwear_goods.goods_name,
                    "sub_category": outwear_goods.sub_category,
                    "image_url": generate_image_url(outwear_goods.goods_url)
                })

            if bottom_goods:
                result["bottom"].append({
                    "goods_name": bottom_goods.goods_name,
                    "sub_category": bottom_goods.sub_category,
                    "image_url": generate_image_url(bottom_goods.goods_url)
                })

            if shoes_goods:
                result["shoes"].append({
                    "goods_name": shoes_goods.goods_name,
                    "sub_category": shoes_goods.sub_category,
                    "image_url": generate_image_url(shoes_goods.goods_url, True)
                })

            return Response(result)
        
        return Response(serializer.errors, status=400)
    
class SaveImageAPIView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(request_body=SaveImageRequestSerializer)
    def post(self, request):
        file_data = request.data.get('file_data')

        if not file_data:
            return Response({"error": "file_data가 필요합니다."}, status=400)

        # 저장
        saved_file = Base64FileTest.objects.create(file_data=file_data)

        return Response({
            "message": "저장 성공",
            "id": saved_file.id
        }, status=201)
    
class UserLikeSetView(APIView):
    permission_classes = [AllowAny]

    # 쿼리 파라미터 정의
    @swagger_auto_schema(manual_parameters=[
        openapi.Parameter('email', openapi.IN_QUERY, description="유저 이메일", type=openapi.TYPE_STRING)
    ])
    def get(self, request):
        email = request.query_params.get('email')
        if not email:
            return Response({"error": "이메일이 필요합니다."}, status=400)

        # 조회 로직
        clothes = PickedClothesTest.objects.filter(email=email)
        result = [{
            "top_goods_name": c.top_goods_name,
            "top_goods_url": c.top_goods_url,
            "outwear_goods_name": c.outwear_goods_name,
            "outwear_goods_url": c.outwear_goods_url,
            "bottom_goods_name": c.bottom_goods_name,
            "bottom_goods_url": c.bottom_goods_url,
            "shoes_goods_name": c.shoes_goods_name,
            "shoes_goods_url": c.shoes_goods_url,
            "detail": c.detail
        } for c in clothes]

        return Response(result)
    
class CancelLikeAPIView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(request_body=CancelLikeSerializer)
    def post(self, request):
        serializer = CancelLikeSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            top_name = serializer.validated_data['top_goods_name']
            bottom_name = serializer.validated_data['bottom_goods_name']

            # 해당 항목 존재 여부 확인
            item = PickedClothesTest.objects.filter(
                email=email,
                top_goods_name=top_name,
                bottom_goods_name=bottom_name
            ).first()

            if not item:
                return Response({"message": "해당 데이터가 없습니다."}, status=404)

            # DroppedClothes에 복사
            DroppedClothes.objects.create(
                email=item.email,
                top_goods_name=item.top_goods_name,
                top_goods_url=item.top_goods_url,
                outwear_goods_name=item.outwear_goods_name,
                outwear_goods_url=item.outwear_goods_url,
                bottom_goods_name=item.bottom_goods_name,
                bottom_goods_url=item.bottom_goods_url,
                shoes_goods_name=item.shoes_goods_name,
                shoes_goods_url=item.shoes_goods_url,
                detail=item.detail,
            )

            # 원래 테이블에서 삭제
            item.delete()

            return Response({"message": "좋아요 취소 → dropped_clothes로 이동 완료."})

        return Response(serializer.errors, status=400)