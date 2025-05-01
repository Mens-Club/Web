from rest_framework import serializers
from .models import PickedClothes

class PickedClothesLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PickedClothes
        fields = '__all__'