from django.db import models

class Clothes(models.Model):
    idx = models.AutoField(primary_key=True)  # 기본 키를 idx로 지정
    color = models.CharField(max_length=50, null=True, blank=True)
    season = models.CharField(max_length=50, null=True, blank=True)
    goods_name = models.CharField(max_length=100)
    thumbnail_url = models.URLField(null=True, blank=True)
    is_soldout = models.CharField(max_length=50, null=True, blank=True)
    goods_url = models.URLField(null=True, blank=True)
    brand = models.CharField(max_length=100, null=True, blank=True)
    normal_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    main_category = models.CharField(max_length=50, null=True, blank=True)
    sub_category = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    image_id = models.CharField(max_length=100, null=True, blank=True)
    s3_path = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        managed = False 
        db_table = 'mens_table_refine'

class Shoes(models.Model):
    idx = models.AutoField(primary_key=True)  # 기본 키를 idx로 지정
    color = models.CharField(max_length=50, null=True, blank=True)
    season = models.CharField(max_length=50, null=True, blank=True)
    goods_name = models.CharField(max_length=100)
    thumbnail_url = models.URLField(null=True, blank=True)
    is_soldout = models.CharField(max_length=50, null=True, blank=True)
    goods_url = models.URLField(null=True, blank=True)
    brand = models.CharField(max_length=100, null=True, blank=True)
    normal_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    sub_category = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    image_id = models.CharField(max_length=100, null=True, blank=True)
    s3_path = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        managed = False  
        db_table = 'shoes_refine'

class PickedClothes(models.Model):
    email = models.EmailField()
    top = models.IntegerField(null=True, blank=True)
    outwear = models.IntegerField(null=True, blank=True)
    bottom = models.IntegerField(null=True, blank=True)
    shoes = models.IntegerField(null=True, blank=True)
    summary_picture = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)