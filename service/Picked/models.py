from django.db import models
from django.conf import settings

class Recommend(models.Model):
    id = models.AutoField(primary_key=True)
    recommendation_code = models.CharField(max_length=255)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=models.CASCADE)
    top = models.ForeignKey('MensTableRefine', db_column='top_id', related_name='recommend_top', on_delete=models.CASCADE)
    bottom = models.ForeignKey('MensTableRefine', db_column='bottom_id', related_name='recommend_bottom', on_delete=models.CASCADE)
    outer = models.ForeignKey('MensTableRefine', db_column='outer_id', related_name='recommend_outer', on_delete=models.CASCADE)
    shoes = models.ForeignKey('ShoesRefine', db_column='shoes_id', on_delete=models.CASCADE)
    answer = models.TextField()
    style = models.CharField(max_length=100)
    total_price = models.IntegerField()
    detail = models.TextField()
    created_at = models.DateTimeField()

    class Meta:
        db_table = 'recommend'
        managed = False

class MainRecommend(models.Model):
    id = models.AutoField(primary_key=True)
    top = models.ForeignKey('MensTableRefine', db_column='top_id', related_name='main_top', on_delete=models.CASCADE)
    bottom = models.ForeignKey('MensTableRefine', db_column='bottom_id', related_name='main_bottom', on_delete=models.CASCADE)
    outer = models.ForeignKey('MensTableRefine', db_column='outer_id', related_name='main_outer', on_delete=models.CASCADE)
    shoes = models.ForeignKey('ShoesRefine', db_column='shoes_id', on_delete=models.CASCADE)
    style = models.CharField(max_length=100)
    total_price = models.IntegerField()
    detail = models.TextField()
    created_at = models.DateTimeField()

    class Meta:
        db_table = 'main_recommend'
        managed = False

class Picked(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=models.CASCADE)
    recommend = models.ForeignKey('Recommend', db_column='recommend_id', on_delete=models.CASCADE)
    created_at = models.DateTimeField()

    class Meta:
        db_table = 'picked'
        managed = False

class MainPicked(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=models.CASCADE)
    main_recommend = models.ForeignKey('MainRecommend', db_column='recommend_id', on_delete=models.CASCADE)
    created_at = models.DateTimeField()

    class Meta:
        db_table = 'main_picked'
        managed = False

class MensTableRefine(models.Model):
    idx = models.BigIntegerField(primary_key=True)

    class Meta:
        db_table = 'mens_table_refine'
        managed = False

class ShoesRefine(models.Model):
    idx = models.BigIntegerField(primary_key=True)

    class Meta:
        db_table = 'shoes_refine'
        managed = False

