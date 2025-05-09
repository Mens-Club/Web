from rest_framework import serializers
from .models import Recommend, Picked, MainRecommend, MainPicked


class LikeSerializer(serializers.Serializer):
    recommend_id = serializers.IntegerField()


class MainLikeSerializer(serializers.Serializer):
    main_recommend_id = serializers.IntegerField()


class RecommendSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recommend
        fields = "__all__"


class RecommendationIDSerializer(serializers.Serializer):
    id = serializers.IntegerField()


class PickedSerializer(serializers.ModelSerializer):
    recommendation = RecommendSerializer(source="recommend")

    class Meta:
        model = Picked
        fields = "__all__"


class MainTableSerializer(serializers.ModelSerializer):
    class Meta:
        model = MainRecommend
        fields = "__all__"


class MainPickedSerializer(serializers.ModelSerializer):
    main = MainTableSerializer(source="main_recommend")

    class Meta:
        model = MainPicked
        fields = "__all__"


class CombinedPickSerializer(serializers.Serializer):
    source = serializers.ChoiceField(choices=["recommend", "main"])
    pick_id = serializers.IntegerField()
    created_at = serializers.DateTimeField()
    combination = serializers.DictField()
