from django.apps import AppConfig


class ClothesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "clothes"

    # def ready(self):
    #     import documents  # 문서 등록을 위한 임포트