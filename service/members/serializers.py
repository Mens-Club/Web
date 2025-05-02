from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

import base64
from django.core.files.base import ContentFile

User = get_user_model()


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "password",
            "profile_pic",
            "body_picture",
            "height",
            "weight",
            "age",
            "sex",
        )

    def validate_email(self, value):
        """
        이메일 중복 검사
        """
        User = get_user_model()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("이미 사용 중인 이메일입니다.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            profile_pic=validated_data.get("profile_pic"),
            body_picture=validated_data.get("body_picture"),
            height=validated_data["height"],
            weight=validated_data["weight"],
            age=validated_data["age"],
            sex=validated_data["sex"],
            is_active=True,  # 이메일 인증 생략 시 True
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        if email and password:
            # 기본 authenticate는 username 필드를 사용하므로 커스텀 인증 필요
            from django.contrib.auth import get_user_model
            User = get_user_model()

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                raise serializers.ValidationError("잘못된 로그인 정보입니다.")

            user = authenticate(username=user.username, password=password)
            if user:
                if not user.is_active:
                    raise serializers.ValidationError("비활성화된 계정입니다.")
                data["user"] = user
            else:
                raise serializers.ValidationError("잘못된 로그인 정보입니다.")
        else:
            raise serializers.ValidationError("모든 필드를 입력해주세요.")

        return data



class UpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["email", "profile_pic", "height", "weight", "age", "sex"]


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(
        write_only=True, validators=[validate_password]
    )

    def validate_current_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("현재 비밀번호가 올바르지 않습니다.")
        return value

class FindEmailSerializer(serializers.Serializer):
    username = serializers.CharField()

    def validate_username(self, value):
        if not User.objects.filter(username=value).exists():
            raise serializers.ValidationError("해당 아이디로 가입된 계정이 없습니다.")
        return value
    
class UserInfoRequestSerializer(serializers.Serializer):
    username = serializers.CharField()

    def validate_username(self, value):
        if not User.objects.filter(username=value).exists():
            raise serializers.ValidationError("해당 아이디로 가입된 계정이 없습니다.")
        return value
    

class Base64ImageField(serializers.ImageField):
    """
    base64로 인코딩된 이미지를 처리하는 커스텀 필드
    """
    def to_internal_value(self, data):
        if isinstance(data, str) and data.startswith('data:image'):
            # base64 데이터에서 형식 및 인코딩 데이터 추출
            format, imgstr = data.split(';base64,') 
            ext = format.split('/')[-1]
            
            # 임시 파일명 생성 (user_upload_path 함수가 최종 경로/파일명 생성)
            temp_filename = f"temp.{ext}"
            
            # base64 디코딩 및 ContentFile 생성
            data = ContentFile(base64.b64decode(imgstr), name=temp_filename)
        
        return super().to_internal_value(data)


class UserImageUploadSerializer(serializers.ModelSerializer):
    upload_picture = Base64ImageField(required=False)
    
    class Meta:
        model = User
        fields = ['upload_picture']
