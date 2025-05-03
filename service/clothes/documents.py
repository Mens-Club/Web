from django_elasticsearch_dsl import Document
from django_elasticsearch_dsl.registries import registry
from .models import Clothes, Shoes

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
            'style',           
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
