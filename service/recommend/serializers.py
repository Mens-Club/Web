from rest_framework import serializers

class RecommendCategorySerializer(serializers.Serializer):
    top = serializers.ListField(child=serializers.CharField(), required=False)
    outer = serializers.ListField(child=serializers.CharField(), required=False)
    bottom = serializers.ListField(child=serializers.CharField(), required=False)
    shoes = serializers.ListField(child=serializers.CharField(), required=False)

class RecommendationResultSerializer(serializers.Serializer):
    answer = serializers.CharField()
    recommend = RecommendCategorySerializer()
