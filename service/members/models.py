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

    upload_picture = models.ImageField(
        upload_to=user_upload_path, null=True, blank=True, verbose_name="의류 사진"
    )

    def __str__(self):
        return self.username


import os
from datetime import datetime


def user_directory_path(instance, filename):
    ext = filename.split(".")[-1]
    now_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{now_str}.{ext}"
    # user가 ForeignKey로 연결되어 있어야 함
    return f"user_{instance.user_id.id}/{filename}"


class YourModel(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    image = models.ImageField(upload_to=user_directory_path)
