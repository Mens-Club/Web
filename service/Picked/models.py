from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class RecommendationTest(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    top_id = models.IntegerField(null=True)
    bottom_id = models.IntegerField(null=True)
    outer_id = models.IntegerField(null=True)
    shoes_id = models.IntegerField(null=True)
    answer = models.TextField(null=True)
    style = models.CharField(max_length=100, null=True)
    total_price = models.IntegerField(null=True)
    liked = models.BooleanField(default=False)
    detail = models.TextField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'recommendation_test'