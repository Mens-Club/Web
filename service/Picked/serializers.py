from rest_framework import serializers
from .models import Recommend, Picked, MainRecommend, MainPicked
from clothes.models import Clothes, Shoes

class LikeSerializer(serializers.Serializer):
    recommend_id = serializers.IntegerField()

class MainLikeSerializer(serializers.Serializer):
    main_recommend_id = serializers.IntegerField()

class ClothesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clothes
        fields = [
            'idx', 'style', 'season', 'fit', 'color', 'goods_name',
            'thumbnail_url', 'is_soldout', 'goods_url', 'brand',
            'normal_price', 'price', 'main_category', 'sub_category',
            'created_at', 'updated_at', 'image_id', 's3_path'
        ]

class ShoesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shoes
        fields = [
            'idx', 'color', 'sub_category', 'season', 'goods_name',
            'thumbnail_url', 'is_soldout', 'goods_url', 'brand',
            'normal_price', 'price', 'created_at', 'updated_at',
            'image_id', 's3_path'
        ]

class RecommendSerializer(serializers.ModelSerializer):
    top = ClothesSerializer()
    bottom = ClothesSerializer()
    outer = ClothesSerializer()
    shoes = ShoesSerializer()

    class Meta:
        model = Recommend
        fields = '__all__'

class PickedSerializer(serializers.ModelSerializer):
    recommendation = RecommendSerializer(source='recommend')

    class Meta:
        model = Picked
        fields = '__all__'

class MainTableSerializer(serializers.ModelSerializer):
    top = ClothesSerializer()
    bottom = ClothesSerializer()
    outer = ClothesSerializer()
    shoes = ShoesSerializer()

    class Meta:
        model = MainRecommend
        fields = '__all__'

class MainPickedSerializer(serializers.ModelSerializer):
    main = MainTableSerializer(source='main_recommend')

    class Meta:
        model = MainPicked
        fields = '__all__'