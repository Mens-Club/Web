from django.db import models
from django.conf import settings

class RecommendationTest(models.Model):
    id = models.AutoField(primary_key=True)
    recommendation_code = models.IntegerField()
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        db_column='user_id',
        on_delete=models.CASCADE
    )
    top_id = models.IntegerField()
    bottom_id = models.IntegerField()
    outer_id = models.IntegerField(null=True, blank=True)
    shoes_id = models.IntegerField()
    answer = models.TextField()
    style = models.CharField(max_length=50)
    total_price = models.IntegerField()
    liked = models.BooleanField()
    detail = models.TextField()
    created_at = models.DateTimeField(null=False, blank=True)

    class Meta:
        db_table = 'recommendation_test'
        managed = False
