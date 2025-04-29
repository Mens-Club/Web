from rest_framework import serializers

class ClothingRequestSerializer(serializers.Serializer):
    top = serializers.CharField()
    outwear = serializers.CharField()
    bottom = serializers.CharField()
    shoes = serializers.CharField()

class SaveImageRequestSerializer(serializers.Serializer):
    file_data = serializers.CharField()