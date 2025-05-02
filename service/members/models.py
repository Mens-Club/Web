from django.db import models
from django.contrib.auth.models import AbstractUser
from .custom_upload import user_upload_path


class User(AbstractUser):

    # 성별 선택
    SEX_CHOICES = [
        ("M", "남성"),
        ("F", "여성"),
    ]

    username = models.CharField(
        max_length=15, unique=True, error_messages={"unique": "이미 사용중인 닉네임"}
    )

    profile_pic = models.ImageField(
        upload_to="profile_pics/", default="default_profile_pic.jpg", blank=True
    )

    weight = models.CharField(
        max_length=10,
        null=True,  # 옵션이라서 null값 허용
        blank=True,  # 폼/유효성검사에서도 필수
    )

    height = models.CharField(
        max_length=10, null=True, blank=True  # 옵션이라서 null값 허용
    )

    # 나중에 변경
    age = models.PositiveIntegerField(null=True, blank=True)
    sex = models.CharField(max_length=1, choices=SEX_CHOICES, default="M")
    body_picture = models.ImageField(upload_to="body_pics/", null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # 사진 업로드
    upload_picture = models.ImageField(
        upload_to=user_upload_path, null=True, blank=True, verbose_name="의류 사진"
    )

    def __str__(self):
        return self.username
