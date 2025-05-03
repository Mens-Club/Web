from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import RecommendationTest
from .serializers import RecommendationTestSerializer, RecommendationIDSerializer
from drf_yasg.utils import swagger_auto_schema

class PickView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(request_body=RecommendationIDSerializer)
    def post(self, request):
        recommendation_id = request.data.get("id")
        
        if not recommendation_id:
            return Response({"error": "추천 ID가 필요합니다."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # recommendation_id에 해당하는 항목을 찾고 liked를 True로 설정
            item = RecommendationTest.objects.get(id=recommendation_id)
            item.liked = not item.liked
            item.save()
            return Response({"success": "추천이 저장되었습니다."}, status=status.HTTP_200_OK)
        except RecommendationTest.DoesNotExist:
            return Response({"error": "추천 항목을 찾을 수 없습니다."}, status=status.HTTP_404_NOT_FOUND)

    def get(self, request):
        user = request.user
        picks = RecommendationTest.objects.filter(user=user, liked=True)
        serializer = RecommendationTestSerializer(picks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
