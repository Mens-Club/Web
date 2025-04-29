from rest_framework.views import APIView
from rest_framework.response import Response
from .models import MensTable, ShoesTest, Base64FileTest
from rest_framework.permissions import AllowAny
from drf_yasg.utils import swagger_auto_schema
from .serializers import RecommendedGoodsRequestSerializer, SaveImageRequestSerializer
import re

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