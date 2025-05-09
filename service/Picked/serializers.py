from rest_framework import serializers

class LikeSerializer(serializers.Serializer):
    recommend_id = serializers.IntegerField()

class MainLikeSerializer(serializers.Serializer):
    main_recommend_id = serializers.IntegerField()


