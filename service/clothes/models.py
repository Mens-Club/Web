from django.db import models

class MensTable(models.Model):
    # 'menstable_test' 테이블과 매핑
    idx = models.AutoField(primary_key=True)  # AutoField로 기본 키 설정
    goods_name = models.CharField(max_length=255)  # 상품명
    sub_category = models.CharField(max_length=255)  # 서브 카테고리

    class Meta:
        db_table = 'menstable_test'  # 실제 DB 테이블 이름
        managed = False  # Django가 테이블을 자동으로 관리하지 않도록 설정
        
class ShoesTest(models.Model):
    idx = models.AutoField(primary_key=True)
    goods_name = models.CharField(max_length=255)
    sub_category = models.CharField(max_length=255)

    class Meta:
        db_table = 'shoes_test'  # shoes_test 테이블
        managed = False  # 기존 테이블 사용

class Base64FileTest(models.Model):
    file_data = models.TextField()

    class Meta:
        db_table = 'save_image_test'
        managed = False  # 기존 테이블에 연결하는 거니까