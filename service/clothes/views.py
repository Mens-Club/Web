from rest_framework import status, viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from drf_yasg.utils import swagger_auto_schema
from elasticsearch import Elasticsearch
import random, time, uuid
from .models import Recommended, Picked
from .serializers import RecommendedSerializer, PickedSerializer
from rest_framework import generics
from drf_yasg import openapi
from rest_framework import mixins, viewsets

es = Elasticsearch("http://localhost:9200")

# class RecommendedGoodsView(APIView):
#     permission_classes = [AllowAny]

#     def get(self, request):
#         test = [
#             {
#                 "top": "셔츠&블라우스 - 긴소매",
#                 "outwear": "슈트&블레이저 자켓",
#                 "bottom": "슈트 팬츠&슬랙스",
#                 "shoes": "미들/하프 부츠"
#             },
#             {
#                 "top": "셔츠&블라우스 - 반소매",
#                 "outwear": "",
#                 "bottom": "숏팬츠",
#                 "shoes": "스포츠/캐주얼 샌들"
#             },
#             {
#                 "top": "후드 티셔츠",
#                 "outwear": "플리스&뽀글이",
#                 "bottom": "데님 팬츠",
#                 "shoes": "캔버스/단화"
#             }
#         ]

#         color_map = [['블랙', '화이트', '블랙', '화이트'], ['화이트', '블랙', '화이트', '블랙']]
#         style_map = ['미니멀', '캐주얼']
#         random_cmap = random.randint(0, len(color_map) - 1)

#         all_results = []

#         for data in test:
#             response_dict = {
#                 "top": '',
#                 "outwear": '',
#                 "bottom": '',
#                 "shoes": '',
#                 "style": '',
#                 "total_price": 0,
#                 "summary_picture": None
#             }

#             for i, (key, value) in enumerate(data.items()):
#                 if not value:  # 값이 없을 경우 무시
#                     continue

#                 print(f"Searching for {key} with value: {value} and color: {color_map[random_cmap][i]}")

#                 query = {
#                     "size": 1,
#                     "query": {
#                         "function_score": {
#                             "query": {
#                                 "bool": {
#                                     "must": [
#                                         {"match": {"sub_category": value}},
#                                         {"match": {"color": color_map[random_cmap][i]}},
#                                         {"match": {"style": style_map[random_cmap]}}
#                                     ]
#                                 }
#                             },
#                             "random_score": {
#                                 "seed": int(time.time()) + i  # 시간에 따라 시드 다르게
#                             }
#                         }
#                     }
#                 }

#                 index_name = "shoes" if key == "shoes" else "clothes"
#                 res = es.search(index=index_name, body=query)

#                 if res["hits"]["hits"]:
#                     item = res["hits"]["hits"][0]["_source"]
#                     response_dict[key] = item["idx"]
#                     response_dict["total_price"] += item['price']
#                     if not response_dict["summary_picture"]:
#                         response_dict["summary_picture"] = item.get("s3_path", "")
#                 else:
#                     print(f"No {key} found for {value}")

#             response_dict['style'] = style_map[random_cmap]
#             all_results.append(response_dict)

#         return Response(all_results, status=status.HTTP_200_OK)

# class PickedClothesMainView(APIView):
#     permission_classes = [AllowAny]

#     def get(self, request):
#         query = {
#             "size": 100,
#             "query": {
#                 "match_all": {}
#             }
#         }

#         try:
#             res = es.search(index="picked_clothes", body=query)
#             all_items = [hit["_source"] for hit in res["hits"]["hits"]]
            
#             # 4개 랜덤 선택 (최대 4개)
#             selected_items = random.sample(all_items, min(4, len(all_items)))
            
#             return Response(selected_items, status=status.HTTP_200_OK)
#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# class PickedClothesMypageView(APIView):
#     # 최신, 오래된순, 가격, 스타일
#     permission_classes = [AllowAny]

#     @swagger_auto_schema(
#         operation_description="사용자의 마이페이지에서 선택된 옷 목록을 조회합니다.",
#         manual_parameters=[
#             openapi.Parameter('email', openapi.IN_QUERY, description="사용자의 이메일", type=openapi.TYPE_STRING),
#         ],
#         responses={
#             200: openapi.Response(
#                 description="사용자의 옷 목록 조회 성공",
#                 schema=openapi.Schema(
#                     type=openapi.TYPE_ARRAY,
#                     items=openapi.Schema(
#                         type=openapi.TYPE_OBJECT,
#                         properties={
#                             'uid': openapi.Schema(type=openapi.TYPE_STRING),  # 추가된 필드
#                             'idx': openapi.Schema(type=openapi.TYPE_INTEGER),
#                             'style': openapi.Schema(type=openapi.TYPE_STRING),
#                             'season': openapi.Schema(type=openapi.TYPE_STRING),
#                             'fit': openapi.Schema(type=openapi.TYPE_STRING),
#                             'color': openapi.Schema(type=openapi.TYPE_STRING),
#                             'goods_name': openapi.Schema(type=openapi.TYPE_STRING),
#                             'thumbnail_url': openapi.Schema(type=openapi.TYPE_STRING),
#                             'is_soldout': openapi.Schema(type=openapi.TYPE_INTEGER),
#                             'goods_url': openapi.Schema(type=openapi.TYPE_STRING),
#                             'brand': openapi.Schema(type=openapi.TYPE_STRING),
#                             'normal_price': openapi.Schema(type=openapi.TYPE_INTEGER),
#                             'price': openapi.Schema(type=openapi.TYPE_INTEGER),
#                             'main_category': openapi.Schema(type=openapi.TYPE_STRING),
#                             'sub_category': openapi.Schema(type=openapi.TYPE_STRING),
#                             'created_at': openapi.Schema(type=openapi.TYPE_STRING),
#                             'updated_at': openapi.Schema(type=openapi.TYPE_STRING),
#                             'image_id': openapi.Schema(type=openapi.TYPE_STRING),
#                             's3_path': openapi.Schema(type=openapi.TYPE_STRING),
#                         }
#                     )
#                 )
#             ),
#             500: "Internal server error"
#         }
#     )
    
#     def get(self, request):
#         email = request.query_params.get("email")
        
#         # email이 제공되지 않으면 에러 반환
#         if not email:
#             return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        
#         query = {
#             "size": 10,
#             "query": {
#                 "term": {
#                     "email.keyword": email  # 정확한 일치를 위해 .keyword 사용
#                 }
#             }
#         }

#         try:
#             res = es.search(index="picked_clothes", body=query)
#             all_items = []

#             for hit in res["hits"]["hits"]:
#                 # hit['_id']는 Elasticsearch에서 자동으로 제공되는 문서의 고유 ID (UUID)가 됩니다.
#                 item = hit["_source"]
#                 item['uid'] = hit["_id"]  # _id를 uid로 추가
#                 all_items.append(item)
            
#             return Response(all_items, status=status.HTTP_200_OK)
#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# class PickedClothesDetailView(APIView):
#     permission_classes = [AllowAny]

#     @swagger_auto_schema(
#         operation_description="상세 제품 정보를 조회합니다.",
#         manual_parameters=[
#             openapi.Parameter('top', openapi.IN_QUERY, description="Top 제품 ID", type=openapi.TYPE_INTEGER),
#             openapi.Parameter('outwear', openapi.IN_QUERY, description="Outwear 제품 ID", type=openapi.TYPE_INTEGER),
#             openapi.Parameter('bottom', openapi.IN_QUERY, description="Bottom 제품 ID", type=openapi.TYPE_INTEGER),
#             openapi.Parameter('shoes', openapi.IN_QUERY, description="Shoes 제품 ID", type=openapi.TYPE_INTEGER),
#         ],
#         responses={
#             200: openapi.Response(
#                 description="제품 상세 조회 성공",
#                 schema=openapi.Schema(
#                     type=openapi.TYPE_OBJECT,
#                     properties={
#                         'top': openapi.Schema(type=openapi.TYPE_OBJECT),
#                         'outwear': openapi.Schema(type=openapi.TYPE_OBJECT),
#                         'bottom': openapi.Schema(type=openapi.TYPE_OBJECT),
#                         'shoes': openapi.Schema(type=openapi.TYPE_OBJECT),
#                     }
#                 )
#             ),
#             500: "Internal server error"
#         }
#     )
    
#     def get(self, request):
#         # 각 카테고리 제품 ID
#         product_ids = {
#             "top": request.query_params.get("top"),
#             "outwear": request.query_params.get("outwear"),
#             "bottom": request.query_params.get("bottom"),
#             "shoes": request.query_params.get("shoes")
#         }
        
#         # 제품 상세 정보를 담을 변수
#         product_details = {}

#         # clothes 인덱스에서 top, outwear, bottom의 상세 정보 조회
#         for category, product_id in product_ids.items():
#             if category in ["top", "outwear", "bottom"]:
#                 # clothes 인덱스에서 제품 정보 가져오기
#                 query = {
#                     "query": {
#                         "match": {
#                             "idx": product_id
#                         }
#                     }
#                 }
#                 res = es.search(index="clothes", body=query)
#                 if res["hits"]["hits"]:
#                     product_details[category] = res["hits"]["hits"][0]["_source"]

#             # shoes 인덱스에서 shoes의 상세 정보 조회
#             elif category == "shoes":
#                 query = {
#                     "query": {
#                         "match": {
#                             "idx": product_id
#                         }
#                     }
#                 }
#                 res = es.search(index="shoes", body=query)
#                 if res["hits"]["hits"]:
#                     product_details[category] = res["hits"]["hits"][0]["_source"]

#         return Response(product_details, status=status.HTTP_200_OK)

# # class PickedClothesLikeAddView(APIView):
# #     permission_classes = [AllowAny]

# #     @swagger_auto_schema(request_body=PickedClothesLikeSerializer)
# #     def post(self, request):
# #         data = request.data

# #         # 검증: 필수값 존재 여부 (간단한 유효성 검증)
# #         required_fields = ['email', 'top', 'bottom', 'shoes', 'summary_picture']
# #         for field in required_fields:
# #             if field not in data:
# #                 return Response({"error": f"'{field}' is required."}, status=status.HTTP_400_BAD_REQUEST)

# #         # null 또는 "" 값은 None 처리
# #         doc = {
# #             "email": data.get("email"),
# #             "top": data.get("top") or None,
# #             "outwear": data.get("outwear") or None,
# #             "bottom": data.get("bottom"),
# #             "shoes": data.get("shoes"),
# #             "summary_picture": data.get("summary_picture"),
# #             "created_at": int(time.time())  # timestamp
# #         }

# #         # Elasticsearch에 저장
# #         res = es.index(index="picked_clothes", id=str(uuid.uuid4()), document=doc)

# #         return Response({"message": "Picked clothes saved to Elasticsearch.", "result": res['result']}, status=status.HTTP_201_CREATED)
	
# class PickedClothesLikeCancelView(APIView):
#     permission_classes = [AllowAny]

#     @swagger_auto_schema(request_body=SaveImageRequestSerializer)
#     def post(self, request):
#         file_data = request.data.get('file_data')

#         if not file_data:
#             return Response({"error": "file_data가 필요합니다."}, status=400)

#         # 저장
#         saved_file = Base64FileTest.objects.create(file_data=file_data)

#         return Response({
#             "message": "저장 성공",
#             "id": saved_file.id
#         }, status=201)
    
# class UserLikeSetView(APIView):
#     permission_classes = [AllowAny]

#     # 쿼리 파라미터 정의
#     @swagger_auto_schema(manual_parameters=[
#         openapi.Parameter('email', openapi.IN_QUERY, description="유저 이메일", type=openapi.TYPE_STRING)
#     ])
#     def get(self, request):
#         email = request.query_params.get('email')
#         if not email:
#             return Response({"error": "이메일이 필요합니다."}, status=400)

#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RecommendViewSet(mixins.ListModelMixin,
                       mixins.CreateModelMixin,
                       viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    queryset = Recommended.objects.all()
    serializer_class = RecommendedSerializer
    def get_permissions(self):
        return [permissions.AllowAny()]

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['top_id', 'bottom_id', 'outer_id', 'shoes_id'],
            properties={
                'top_id': openapi.Schema(type=openapi.TYPE_INTEGER, example=101),
                'bottom_id': openapi.Schema(type=openapi.TYPE_INTEGER, example=202),
                'outer_id': openapi.Schema(type=openapi.TYPE_INTEGER, example=303),
                'shoes_id': openapi.Schema(type=openapi.TYPE_INTEGER, example=404),
            },
        ),
        responses={201: RecommendedSerializer}
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class PickedViewSet(mixins.ListModelMixin,       # GET /picks/
                    mixins.CreateModelMixin,     # POST /picks/
                    mixins.DestroyModelMixin,    # DELETE /picks/{id}/
                    viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    queryset = Picked.objects.all()
    serializer_class = PickedSerializer
    def get_permissions(self):
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)