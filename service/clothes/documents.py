from django_elasticsearch_dsl import Document
from django_elasticsearch_dsl.registries import registry
from .models import Clothes, Shoes, PickedClothes

@registry.register_document
class ClothesDocument(Document):
    class Index:
        name = 'clothes' 
        settings = {
            'number_of_shards': 1,
            'number_of_replicas': 0
        }

    class Django:
        model = Clothes
        fields = [
            'idx',
            'color',
            'season',
            'goods_name',
            'thumbnail_url',
            'is_soldout',
            'goods_url',
            'brand',
            'normal_price',
            'price',
            'main_category',
            'sub_category',
            'created_at',
            'updated_at',
            'image_id',
            's3_path'
        ]


@registry.register_document
class ShoesDocument(Document):
    class Index:
        name = 'shoes'
        settings = {
            'number_of_shards': 1,
            'number_of_replicas': 0
        }

    class Django:
        model = Shoes
        fields = [
            'idx',
            'color',
            'season',
            'goods_name',
            'thumbnail_url',
            'is_soldout',
            'goods_url',
            'brand',
            'normal_price',
            'price',
            'sub_category',
            'created_at',
            'updated_at',
            'image_id',
            's3_path'
        ]

@registry.register_document
class PickedClothesDocument(Document):
    class Index:
        name = 'picked_clothes'  # Elasticsearch 인덱스 이름
        settings = {
            'number_of_shards': 1,
            'number_of_replicas': 0
        }

    class Django:
        model = PickedClothes
        fields = [
            'email',
            'top',
            'outwear',
            'bottom',
            'shoes',
            'summary_picture',
            'created_at'
        ]