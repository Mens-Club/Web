import random
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import MenTableTest, Base64FileTest
from rest_framework.permissions import AllowAny
from drf_yasg.utils import swagger_auto_schema
from .serializers import ClothingRequestSerializer, SaveImageRequestSerializer

class RandomGoodsAPIView(APIView):
    
    @swagger_auto_schema(request_body=ClothingRequestSerializer)
    def post(self, request):
        top = request.data.get('top')
        bottom = request.data.get('bottom')
        shoes = request.data.get('shoes')

        if not (top and bottom and shoes):
            return Response({"error": "top, bottom, shoes 값을 모두 보내주세요."}, status=400)

        # sub_category가 top, bottom, shoes 중 하나인 것만 필터
        candidates = MenTableTest.objects.filter(sub_category__in=[top, bottom, shoes])

        if not candidates.exists():
            return Response({"error": "해당하는 상품이 없습니다."}, status=404)

        random_item = random.choice(candidates)

        return Response({
            "goods_name": random_item.goods_name,
            "sub_category": random_item.sub_category
        })
    
class SaveImageAPIView(APIView):
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