from django.db import models
from django.conf import settings

class Clothes(models.Model):
    idx = models.AutoField(primary_key=True)
    category = models.CharField(max_length=100)
    seasons = models.CharField(max_length=100)
    fit = models.CharField(max_length=100)
    color = models.CharField(max_length=100)
    name = models.CharField(max_length=255)
    image_url = models.URLField()
    discount_price = models.IntegerField()
    original_price = models.IntegerField()
    category_type = models.CharField(max_length=50)
    sub_category = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

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
    top_id = models.CharField(max_length=100)
    bottom_id = models.CharField(max_length=100)
    outer_id = models.CharField(max_length=100)
    shoes_id = models.CharField(max_length=100)
    
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