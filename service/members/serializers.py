from rest_framework import serializers
from .models import UserUpload

from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

from .utils.custom_base64handle import Base64ImageField


from .utils.custom_base64handle import Base64ImageField

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
        fields = ["username", "height", "weight", "age", "sex"]


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


from .models import UserUpload


class UserImageUploadSerializer(serializers.ModelSerializer):

    image = Base64ImageField()

    class Meta:
        model = UserUpload
        fields = ["image"]  # image 필드 직접 받음

    def create(self, validated_data):
        user = self.context["user"]
        upload = UserUpload.objects.create(user=user, **validated_data)
        return upload
