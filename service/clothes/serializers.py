from rest_framework import serializers

class RecommendedGoodsRequestSerializer(serializers.Serializer):
    top = serializers.CharField(required=True)
    outwear = serializers.CharField(required=True)
    bottom = serializers.CharField(required=True)
    shoes = serializers.CharField(required=True)

class SaveImageRequestSerializer(serializers.Serializer):
    file_data = serializers.CharField()