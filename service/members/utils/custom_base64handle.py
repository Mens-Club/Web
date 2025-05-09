from rest_framework import serializers
from django.core.files.base import ContentFile

import base64


class Base64ImageField(serializers.ImageField):
    """
    base64로 인코딩된 이미지를 처리하는 커스텀 필드
    """

    def to_internal_value(self, data):
        if isinstance(data, str) and data.startswith("data:image"):
            # base64 데이터에서 형식 및 인코딩 데이터 추출
            format, imgstr = data.split(";base64,")
            ext = format.split("/")[-1]

            # 임시 파일명 생성 (user_upload_path 함수가 최종 경로/파일명 생성)
            temp_filename = f"temp.{ext}"

            # base64 디코딩 및 ContentFile 생성
            data = ContentFile(base64.b64decode(imgstr), name=temp_filename)

        return super().to_internal_value(data)
