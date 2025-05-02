from rest_framework import viewsets, permissions, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from .models import Recommended, Picked
from .serializers import RecommendedSerializer, PickedSerializer, RecommendedCreateSerializer
from drf_yasg import openapi
from rest_framework import mixins, viewsets
from rest_framework.response import Response

class RecommendedViewSet(viewsets.ModelViewSet):
    queryset = Recommended.objects.all()
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'create':
            return RecommendedCreateSerializer
        return RecommendedSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        recommended = serializer.save()
        read_serializer = RecommendedSerializer(recommended)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)
    
class PickedViewSet(mixins.ListModelMixin,
                    mixins.CreateModelMixin,
                    mixins.DestroyModelMixin,
                    viewsets.GenericViewSet):
    queryset = Picked.objects.all()
    serializer_class = PickedSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Picked.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)