import base64
import uuid
from django.core.files.base import ContentFile
from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage
import boto3

class IwinvStorage(S3Boto3Storage):
    def __init__(self, *args, **kwargs):
        kwargs['endpoint_url'] = settings.ENDPOINT_URL
        super().__init__(*args, **kwargs)

    def _get_client(self):
        return boto3.client(
            service_name=settings.SERVICE_NAME,
            endpoint_url=settings.ENDPOINT_URL,
            region_name=settings.REGION_NAME,
            aws_access_key_id=settings.ACCESS_KEY,
            aws_secret_access_key=settings.SECRET_KEY,
            config=boto3.session.Config(signature_version="s3v4")
        )


def upload_base64_to_s3(base64_image, user_id):
    if ',' in base64_image:
        header, base64_image = base64_image.split(',')
        file_extension = header.split('/')[1].split(';')[0]
    else:
        file_extension = 'jpeg'  # 기본값

    try:
        # base64 디코딩
        image_data = base64.b64decode(base64_image)
    except Exception as e:
        raise ValueError(f'이미지 디코딩 실패: {str(e)}')
    
    unique_filename = f'{user_id}/{uuid.uuid4()}.{file_extension}'
    
    s3_storage = IwinvStorage()  # 여기를 IwinvStorage로 변경
    
    file_path = s3_storage.save(
        unique_filename, 
        ContentFile(image_data)
    )
    
    photo_url = f'{settings.ENDPOINT_URL}/{settings.STORAGE_BUCKET_NAME}/{file_path}'

    return photo_url