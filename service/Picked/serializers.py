from rest_framework import serializers
from recommend.models import RecommendationBookmark, MainRecommendation, MainRecommendationBookmark


class MainRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = MainRecommendation
        fields = '__all__' 

class RecommendationBookmarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecommendationBookmark
        fields = '__all__'

class MainRecommendationBookmarkSerializer(serializers.ModelSerializer):
    main_recommendation = MainRecommendationSerializer()
    
    class Meta:
        model = MainRecommendationBookmark
        fields = ['id', 'user', 'main_recommendation', 'created_at']
