from rest_framework import serializers
from recommend.models import (
    Recommendation,
    RecommendationBookmark,
    MainRecommendation,
    MainRecommendationBookmark,
)


class RecommendationSerializer(serializers.ModelSerializer):
    top = serializers.SerializerMethodField()
    bottom = serializers.SerializerMethodField()
    outer = serializers.SerializerMethodField()
    shoes = serializers.SerializerMethodField()
    user = serializers.IntegerField(source="user.id", read_only=True)

    class Meta:
        model = Recommendation
        fields = [
            "id",
            "recommendation_code",
            "user",
            "answer",
            "reasoning_text",
            "style",
            "created_at",
            "total_price",
            "top",
            "bottom",
            "outer",
            "shoes",
        ]

    def get_top(self, obj):
        return self.serialize_clothes(obj.top)

    def get_bottom(self, obj):
        return self.serialize_clothes(obj.bottom)

    def get_outer(self, obj):
        return self.serialize_clothes(obj.outer)

    def get_shoes(self, obj):
        return self.serialize_clothes(obj.shoes)

    def serialize_clothes(self, item):
        if item is None:
            return None
        return {
            "category": item.sub_category,
            "goods_name": item.goods_name,
            "goods_url": item.goods_url,
            "price": item.price,
            "brand": item.brand,
            "s3_path": item.s3_path,
        }


class MainRecommendationSerializer(serializers.ModelSerializer):
    top = serializers.SerializerMethodField()
    bottom = serializers.SerializerMethodField()
    outer = serializers.SerializerMethodField()
    shoes = serializers.SerializerMethodField()

    class Meta:
        model = MainRecommendation
        fields = [
            "id",
            "reasoning_text",
            "style",
            "created_at",
            "total_price",
            "top",
            "bottom",
            "outer",
            "shoes",
        ]

    def get_top(self, obj):
        return self.serialize_clothes(obj.top)

    def get_bottom(self, obj):
        return self.serialize_clothes(obj.bottom)

    def get_outer(self, obj):
        return self.serialize_clothes(obj.outer)

    def get_shoes(self, obj):
        return self.serialize_clothes(obj.shoes)

    def serialize_clothes(self, item):
        if item is None:
            return None
        return {
            "id": item.id,
            "category": item.sub_category,
            "goods_name": item.goods_name,
            "goods_url": item.goods_url,
            "price": item.price,
            "brand": item.brand,
            "s3_path": item.s3_path,
        }


class RecommendationBookmarkSerializer(serializers.ModelSerializer):
    recommendation = RecommendationSerializer()

    class Meta:
        model = RecommendationBookmark
        fields = ["id", "created_at", "whether_main", "user", "recommendation"]


class MainRecommendationBookmarkSerializer(serializers.ModelSerializer):
    main_recommendation = MainRecommendationSerializer()

    class Meta:
        model = MainRecommendationBookmark
        fields = ["id", "user", "main_recommendation", "created_at"]
