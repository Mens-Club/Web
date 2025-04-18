from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):

    # 성별 선택
    SEX_CHOICES = [
        ('M', '남성'),
        ('F', '여성'),
    ]

    username = models.CharField(
        max_length=15, unique=True,
        error_messages={
            "unique" : "이미 사용중인 닉네임"
        }
    )

    profile_pic = models.ImageField(
        upload_to="profile_pics/",
        default="default_profile_pic.jpg",
        blank=True
    )

    weight = models.CharField(
        max_length=10,
        null=False,  # DB에서 NOT NULL
        blank=False  # 폼/유효성검사에서도 필수
    )

    height = models.CharField(
        max_length=10,
        null=False,
        blank=False
    )
    age = models.PositiveIntegerField(null=False, blank=False)
    sex = models.CharField(max_length=1, choices=SEX_CHOICES, default='M')
    body_picture = models.ImageField(upload_to='body_pics/', null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username