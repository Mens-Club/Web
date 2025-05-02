from django.db import models
from django.conf import settings

class Recommended(models.Model):
    id = models.AutoField(primary_key=True)
    top_id = models.IntegerField()
    bottom_id = models.IntegerField()
    outer_id = models.IntegerField()
    shoes_id = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)  # 생성 시 자동 저장

    def __str__(self):
        return f"Recommend #{self.id}"

class Picked(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    recommend = models.ForeignKey(Recommended, on_delete=models.CASCADE, related_name='picks')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} picked Recommend #{self.recommend.id}"