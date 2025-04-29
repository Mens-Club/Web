from django.db import models

class MenTableTest(models.Model):
    idx = models.AutoField(primary_key=True)  # idx를 primary key로 지정
    goods_name = models.CharField(max_length=255)
    sub_category = models.CharField(max_length=255)

    class Meta:
        db_table = 'menstable_test'  # 실제 DB 테이블명
        managed = False  # Django가 이 테이블을 생성/수정하지 않게

class Base64FileTest(models.Model):
    file_data = models.TextField()

    class Meta:
        db_table = 'base64_file_test'
        managed = False  # 기존 테이블에 연결하는 거니까