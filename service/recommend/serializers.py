# serializers.py
from rest_framework import serializers

class FashionSimilaritySearchSerializer(serializers.Serializer):
    image_url = serializers.URLField(required=True, help_text="검색할 이미지의 URL")
    top_k = serializers.IntegerField(
        default=5, 
        min_value=1, 
        max_value=20, 
        help_text="반환할 유사 아이템 개수 (1-20)"
    )
    
    def validate_image_url(self, value):
        """
        URL 유효성 검사
        """
        if not value.startswith(('http://', 'https://')):
            raise serializers.ValidationError("유효한 URL이 아닙니다")
        return value