from rest_framework import serializers
from .models import Recommended, Picked

class RecommendedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recommended
        fields = '__all__'

class PickedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Picked
        fields = '__all__'
