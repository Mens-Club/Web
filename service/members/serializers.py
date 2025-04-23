from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

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
    
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get("username")
        password = data.get("password")

        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if not user.is_active:
                    raise serializers.ValidationError(_("비활성화된 계정입니다."))
                data['user'] = user
            else:
                raise serializers.ValidationError(_("잘못된 로그인 정보입니다."))
        else:
            raise serializers.ValidationError(_("모든 필드를 입력해주세요."))

        return data