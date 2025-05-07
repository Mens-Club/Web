# models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from .custom_upload import user_upload_path


class User(AbstractUser):
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
    weight = models.CharField(max_length=10, null=True, blank=True)
    height = models.CharField(max_length=10, null=True, blank=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    sex = models.CharField(max_length=1, choices=SEX_CHOICES, default="M")
    body_picture = models.ImageField(upload_to="body_pics/", null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username


class UserUpload(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="uploads")
    image = models.ImageField(upload_to=user_upload_path, verbose_name="의류 사진")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]  # 최신순 정렬

    def __str__(self):
        return f"{self.user.username} - {self.created_at.strftime('%Y-%m-%d %H:%M:%S')}"
