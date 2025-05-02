from pathlib import Path
from datetime import timedelta
import os
from dotenv import load_dotenv

import logging
logging.basicConfig(level=logging.DEBUG)

import boto3
boto3.set_stream_logger('', logging.DEBUG)

load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

AUTH_USER_MODEL = "members.User"
# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "django-insecure-4#jb3(xl4yoa58ti+lhpmdgt2e6$6j68cho%*w@ge3z9qhfv#v"

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["*"]


MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')  
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')

# Application definition

INSTALLED_APPS = [
    "django.contrib.sites",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.socialaccount.providers.google",
    "allauth.socialaccount.providers.kakao",
    "allauth.socialaccount.providers.naver",
    "rest_framework.authtoken",
    "corsheaders",
    'django_elasticsearch_dsl', # elastic search 
    "drf_yasg",
    "members",
    "clothes",
    'storages'

]



# settings.py
STORAGES = {
    "default": {
        "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
        "OPTIONS": {
            "access_key": os.getenv("ACCESS_KEY"),
            "secret_key": os.getenv("SECRET_KEY"),
            "bucket_name": os.getenv("STORAGE_BUCKET_NAME"),
            "endpoint_url": os.getenv("ENDPOINT_URL"),
            "region_name": os.getenv("REGION_NAME"),
            "addressing_style": "path",
            "signature_version": "s3v4",
            "default_acl": "public-read",
            "querystring_auth": False,
            "object_parameters": {
                "CacheControl": "max-age=86400",
            },
        },
    },
    "staticfiles": {
    "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
    "OPTIONS": {
        "access_key": os.getenv("ACCESS_KEY"),
        "secret_key": os.getenv("SECRET_KEY"),
        "bucket_name": os.getenv("STORAGE_BUCKET_NAME"),
        "endpoint_url": os.getenv("ENDPOINT_URL"),
        "region_name": os.getenv("REGION_NAME"),
        "addressing_style": "path",
        "signature_version": "s3v4",
        "default_acl": "public-read",
        "querystring_auth": False,
        "location": "static",  # 정적 파일용 별도 경로
        "object_parameters": {
            "CacheControl": "max-age=86400",
            },
        },
    },
}


CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React 개발 서버 주소
]

CORS_ALLOW_CREDENTIALS = True

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
    "corsheaders.middleware.CorsMiddleware",
]

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=5),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": False,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    "VERIFYING_KEY": None,
    "AUDIENCE": None,
    "ISSUER": None,
    "JWK_URL": None,
    "LEEWAY": 0,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
    "USER_AUTHENTICATION_RULE": "rest_framework_simplejwt.authentication.default_user_authentication_rule",
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
    "TOKEN_TYPE_CLAIM": "token_type",
    "TOKEN_USER_CLASS": "rest_framework_simplejwt.models.TokenUser",
    "JTI_CLAIM": "jti",
    "SLIDING_TOKEN_REFRESH_EXP_CLAIM": "refresh_exp",
    "SLIDING_TOKEN_LIFETIME": timedelta(minutes=60),
    "SLIDING_TOKEN_REFRESH_LIFETIME": timedelta(days=1),
}

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# Local
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": os.environ['MYSQL_DATABASE'],
        "USER": os.environ['MYSQL_USER'],
        "PASSWORD": os.environ['MYSQL_PASSWORD'],
        "HOST": os.environ['MYSQL_HOST'],
        "PORT": os.environ['MYSQL_PORT'],
    }
}

ELASTICSEARCH_DSL = {
    'default': {
        'hosts': 'http://localhost:9200'  # 'http://' 스키마 추가
    },
}

# 인덱스 이름 매핑
ELASTICSEARCH_INDEX_NAMES = {
    'clothes.documents.ClothesDocument': 'clothes',
    'clothes.documents.ShoesDocument': 'shoes'
}


AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",  # JWT 인증 사용
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",  # 기본적으로 인증된 사용자만 접근 가능
        "rest_framework.parsers.JSONParser",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 10,  # 페이지당 10개씩 조회
}


LANGUAGE_CODE = "ko-kr"  # 국가 설정
TIME_ZONE = "Asia/Seoul"  # 시간대 설정
USE_I18N = True  # 국제화(Internationalization)
USE_L10N = True  # 지역화(localization)
USE_TZ = False  # Django 시간대


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = "static/"

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

SWAGGER_SETTINGS = {
    "USE_SESSION_AUTH": False,
    "SECURITY_DEFINITIONS": {
        "Bearer": {
            "type": "apiKey",
            "in": "header",
            "name": "Authorization",
            "description": "JWT Bearer Token",
        }
    },
    "SECURITY": [{"Bearer": []}],
}

AUTHENTICATION_BACKENDS = ("allauth.account.auth_backends.AuthenticationBackend",)

SITE_ID = 1

LOGIN_REDIRECT_URL = "http://localhost:3000/main"  # 로그인 후 리디렉션할 URL
LOGOUT_REDIRECT_URL = "/accounts/google/login"

SOCIALACCOUNT_PROVIDERS = {
    "google": {
        "SCOPE": [
            "email",
            "profile",
        ],
        "AUTH_PARAMS": {
            "access_type": "online",
        },
        "OAUTH_PKCE_ENABLED": True,  # Optional: Use PKCE (Proof Key for Code Exchange)
    },
    "kakao": {
        "SCOPE": ["profile_nickname"],
        "AUTH_PARAMS": {"access_type": "online"},
        "METHOD": "oauth2",
        "VERIFIED_EMAIL": False,
        "APP": {"client_id": os.environ["KAKAO_CLIENT_ID"], "secret": "", "key": ""},
    },
    "naver": {
        "SCOPE": ["name", "email"],
        "AUTH_PARAMS": {"access_type": "online"},
        "APP": {
            "client_id": os.environ["NAVER_CLIENT_ID"],
            "secret": os.environ["NAVER_SECRET"],
            "key": "",
        },
    },
}

SOCIALACCOUNT_LOGIN_ON_GET = True


ELASTICSEARCH_DSL = {
    'default': {
        'hosts': 'http://localhost:9200'
    }
}

