from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'password',
            'profile_pic', 'body_picture',
            'height', 'weight', 'age', 'sex'
        )

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            profile_pic=validated_data.get('profile_pic'),
            body_picture=validated_data.get('body_picture'),
            height=validated_data['height'],
            weight=validated_data['weight'],
            age=validated_data['age'],
            sex=validated_data['sex'],
            is_active=True  # 이메일 인증 생략 시 True
        )
        return user