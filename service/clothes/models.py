from django.db import models
from django.conf import settings

class Clothes(models.Model):
    idx = models.BigIntegerField(primary_key=True)  # 기존의 idx 컬럼에 맞게 타입 수정
    style = models.TextField(null=True, blank=True)  # style 컬럼
    season = models.TextField(null=True, blank=True)  # season 컬럼
    fit = models.TextField(null=True, blank=True)  # fit 컬럼
    color = models.TextField(null=True, blank=True)  # color 컬럼
    goods_name = models.TextField(null=True, blank=True)  # goods_name 컬럼
    thumbnail_url = models.TextField(null=True, blank=True)  # thumbnail_url 컬럼
    is_soldout = models.BigIntegerField(null=True, blank=True)  # is_soldout 컬럼
    goods_url = models.TextField(null=True, blank=True)  # goods_url 컬럼
    brand = models.TextField(null=True, blank=True)  # brand 컬럼
    normal_price = models.BigIntegerField(null=True, blank=True)  # normal_price 컬럼
    price = models.BigIntegerField(null=True, blank=True)  # price 컬럼
    main_category = models.TextField(null=True, blank=True)  # main_category 컬럼
    sub_category = models.TextField(null=True, blank=True)  # sub_category 컬럼
    created_at = models.DateTimeField(null=True, blank=True)  # created_at 컬럼
    updated_at = models.DateTimeField(null=True, blank=True)  # updated_at 컬럼
    image_id = models.TextField(null=True, blank=True)  # image_id 컬럼
    s3_path = models.TextField(null=True, blank=True)  # s3_path 컬럼

    def __str__(self):
        return self.goods_name

    class Meta:
        db_table = 'mens_table_refine'
        managed = False

class Shoes(models.Model):
    idx = models.BigIntegerField(primary_key=True)
    color = models.TextField(null=True)
    sub_category = models.TextField(null=True)
    season = models.TextField(null=True)
    goods_name = models.TextField(null=True)
    thumbnail_url = models.TextField(null=True)
    is_soldout = models.BigIntegerField(null=True)
    goods_url = models.TextField(null=True)
    brand = models.TextField(null=True)
    normal_price = models.BigIntegerField(null=True)
    price = models.BigIntegerField(null=True)
    created_at = models.DateTimeField(null=True)
    updated_at = models.DateTimeField(null=True)
    image_id = models.TextField(null=True)
    s3_path = models.TextField(null=True)

    def __str__(self):
        return self.goods_name

    class Meta:
        db_table = 'shoes_refine'
        managed = False

class Recommended(models.Model):
    id = models.AutoField(primary_key=True)
    top = models.ForeignKey('Clothes', related_name='top_recommendations', on_delete=models.CASCADE, null=True, blank=True)
    bottom = models.ForeignKey('Clothes', related_name='bottom_recommendations', on_delete=models.CASCADE, null=True, blank=True)
    outer = models.ForeignKey('Clothes', related_name='outer_recommendations', on_delete=models.CASCADE, null=True, blank=True)
    shoes = models.ForeignKey('Shoes', related_name='shoes_recommendations', on_delete=models.CASCADE, null=True, blank=True)
    season = models.CharField(max_length=100)
    style = models.CharField(max_length=100)  
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Recommend #{self.id}"

    class Meta:
        db_table = 'recommended'
        managed = False

class Picked(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    recommend = models.ForeignKey(Recommended, on_delete=models.CASCADE, related_name='picks')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} picked Recommend #{self.recommend.id}"    
    
    class Meta:
        db_table = 'picked'
        managed = False