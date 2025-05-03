from django.db import models
from django.conf import settings

class Clothes(models.Model):
    idx = models.BigIntegerField(primary_key=True)  
    style = models.TextField(null=True, blank=True)  
    season = models.TextField(null=True, blank=True)  
    fit = models.TextField(null=True, blank=True)  
    color = models.TextField(null=True, blank=True) 
    goods_name = models.TextField(null=True, blank=True)  
    thumbnail_url = models.TextField(null=True, blank=True)  
    is_soldout = models.BigIntegerField(null=True, blank=True)  
    goods_url = models.TextField(null=True, blank=True) 
    brand = models.TextField(null=True, blank=True) 
    normal_price = models.BigIntegerField(null=True, blank=True)  
    price = models.BigIntegerField(null=True, blank=True) 
    main_category = models.TextField(null=True, blank=True)  
    sub_category = models.TextField(null=True, blank=True)  
    created_at = models.DateTimeField(null=True, blank=True) 
    updated_at = models.DateTimeField(null=True, blank=True) 
    image_id = models.TextField(null=True, blank=True)  
    s3_path = models.TextField(null=True, blank=True)  

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
