from rest_framework import serializers
from .models import RecommendationTest

class RecommendationTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecommendationTest
        fields = '__all__'

class RecommendationIDSerializer(serializers.Serializer):
    id = serializers.IntegerField()
