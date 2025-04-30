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

# class Base64FileTest(models.Model):
#     file_data = models.TextField()

#     class Meta:
#         db_table = 'save_image_test'
#         managed = False  # 기존 테이블에 연결하는 거니까

# class PickedClothesTest(models.Model):
#     id = models.AutoField(primary_key=True)
#     email = models.EmailField()
#     top_goods_name = models.CharField(max_length=255)
#     top_goods_url = models.CharField(max_length=255)
#     outwear_goods_name = models.CharField(max_length=255)
#     outwear_goods_url = models.CharField(max_length=255)
#     bottom_goods_name = models.CharField(max_length=255)
#     bottom_goods_url = models.CharField(max_length=255)
#     shoes_goods_name = models.CharField(max_length=255)
#     shoes_goods_url = models.CharField(max_length=255)
#     detail = models.CharField(max_length=500)

#     class Meta:
#         db_table = 'picked_clothes_test'
#         managed = False  # 이미 존재하는 테이블이라면

# class DroppedClothes(models.Model):
#     email = models.CharField(max_length=255)
#     top_goods_name = models.CharField(max_length=255)
#     top_goods_url = models.CharField(max_length=255)
#     outwear_goods_name = models.CharField(max_length=255)
#     outwear_goods_url = models.CharField(max_length=255)
#     bottom_goods_name = models.CharField(max_length=255)
#     bottom_goods_url = models.CharField(max_length=255)
#     shoes_goods_name = models.CharField(max_length=255)
#     shoes_goods_url = models.CharField(max_length=255)
#     detail = models.CharField(max_length=500)

#     class Meta:
#         db_table = 'dropped_clothes_test'
#         managed = False  # 기존 테이블에만 사용