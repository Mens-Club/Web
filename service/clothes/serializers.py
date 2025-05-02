from rest_framework import serializers
from .models import Picked, Recommended, Clothes, Shoes
from members.models import User

class ClothesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clothes
        fields = ['idx', 'goods_name', 'goods_url', 'sub_category', 'style', 's3_path', 'price', 'brand']

class ShoesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shoes
        fields = ['idx', 'goods_name', 'goods_url', 'sub_category', 's3_path', 'price', 'brand']

class RecommendedSerializer(serializers.ModelSerializer):
    top_clothes = ClothesSerializer(source='top', read_only=True)
    bottom_clothes = ClothesSerializer(source='bottom', read_only=True)
    outer_clothes = ClothesSerializer(source='outer', read_only=True)
    shoes = ShoesSerializer(read_only=True)

    class Meta:
        model = Recommended
        fields = [
            'id', 'top_clothes', 'bottom_clothes', 'outer_clothes', 'shoes',
            'season', 'style', 'created_at'
        ]

class RecommendedCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recommended
        fields = ['top', 'bottom', 'outer', 'shoes', 'season', 'style']

    extra_kwargs = {
        'top': {'write_only': True},
        'bottom': {'write_only': True},
        'outer': {'write_only': True},
        'shoes': {'write_only': True},
    }

class RecommendedSerializer(serializers.ModelSerializer):
    top_clothes = ClothesSerializer(source='top', read_only=True)
    bottom_clothes = ClothesSerializer(source='bottom', read_only=True)
    outer_clothes = ClothesSerializer(source='outer', read_only=True)
    shoes = ShoesSerializer(read_only=True)

    class Meta:
        model = Recommended
        fields = ['id', 'top_clothes', 'bottom_clothes', 'outer_clothes', 'shoes', 'season', 'style', 'created_at']
        
class PickedSerializer(serializers.ModelSerializer):
    recommend = serializers.PrimaryKeyRelatedField(queryset=Recommended.objects.all())
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())  # `User` 모델의 인스턴스 참조

    class Meta:
        model = Picked
        fields = ['id', 'user', 'recommend', 'created_at']
        read_only_fields = ['id', 'created_at']  # 'id'와 'created_at'은 읽기 전용으로 설정