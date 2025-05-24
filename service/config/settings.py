from pathlib import Path
from datetime import timedelta
import os
from dotenv import load_dotenv

import logging
from datetime import timedelta
import boto3

logging.basicConfig(level=logging.DEBUG)
boto3.set_stream_logger("", logging.DEBUG)

load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

AUTH_USER_MODEL = "members.User"
# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = [
    "localhost",
    "mensclub-api.store",
    "www.mensclub-api.store",
    "mensclub-fashion.store",
    "www.mensclub-fashion.store",
    os.getenv("MAIN_HOST")
]

MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")
STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "static")

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
    "django_elasticsearch_dsl",
    "drf_yasg",
    "members",
    "clothes",
    "Picked",
    "storages",
    "recommend",
]

# Redis 캐시
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": os.getenv("CACHE_URL"),
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        },
    }
}

# s3 storage
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
        "BACKEND": "storages.backends.s3boto3.S3StaticStorage",
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
            "location": "static",  # 정적 파일 전용 prefix
            "object_parameters": {
                "CacheControl": "max-age=86400",
            },
        },
    },
}

CSRF_TRUSTED_ORIGINS = [
    "https://mensclub-api.store",
    "https://mensclub-fashion.store",
    "http://localhost:3000",
    "http://localhost:8000"
]

CORS_ALLOWED_ORIGINS = [
    "https://mensclub-fashion.store",
    "http://localhost:3000"
]


CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    "authorization",
    "content-type",
]

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
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=5000),  # 액세스 토큰 유효기간: 60분
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),  # 리프레시 토큰 유효기간: 1일
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": False,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": os.getenv("JWT_SECRET"),
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


DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": os.environ["MYSQL_DATABASE"],
        "USER": os.environ["MYSQL_USER"],
        "PASSWORD": os.environ["MYSQL_PASSWORD"],
        "HOST": os.environ["MYSQL_HOST"],
        "PORT": os.environ["MYSQL_PORT"],
    }
}

ELASTICSEARCH_URL = os.getenv("ELASTICSEARCH_URL")

ELASTICSEARCH_DSL = {
    "default": {
        "hosts": ELASTICSEARCH_URL,
        "http_auth": (
            os.getenv("ELASTICSEARCH_KEY"),
            os.getenv("ELASTICSEARCH_ACCESS"),
        ),
    },
}

# 인덱스 이름 매핑
ELASTICSEARCH_INDEX_NAMES = {
    "clothes.documents.ClothesDocument": "clothes",
    "clothes.documents.ShoesDocument": "shoes",
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

# JWT 설정 추가
REST_AUTH = {
    "USE_JWT": True,
    "JWT_AUTH_HTTPONLY": False,  # 프론트엔드에서 토큰에 접근할 수 있도록 설정
}


REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_PARSER_CLASSES": (
        "rest_framework.parsers.JSONParser",
        "rest_framework.parsers.FormParser",
        "rest_framework.parsers.MultiPartParser",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 10,
}


LANGUAGE_CODE = "ko-kr"  # 국가 설정
TIME_ZONE = "Asia/Seoul"  # 시간대 설정
USE_I18N = True  # 국제화(Internationalization)
USE_L10N = True  # 지역화(localization)
USE_TZ = False  # Django 시간대


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/


MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")
STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "static")

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


SOCIALACCOUNT_STORE_TOKEN = True
LOGIN_REDIRECT_URL = "/api/account/v1/social-callback/"
SOCIALACCOUNT_ADAPTER = "members.token_toss.CustomSocialAccountAdapter"
SOCIALACCOUNT_LOGIN_ON_GET = True
LOGOUT_REDIRECT_URL = "/"

# 로그 수집
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "simple": {
            "format": "[%(asctime)s] %(levelname)s %(name)s %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "WARNING",
    },
    "handlers": {
        "logstash": {
            "level": "INFO",
            "class": "logstash.TCPLogstashHandler",
            "host": os.getenv("LOGSTASH_HOST"),
            "port": int(os.getenv("LOGSTASH_PORT")),
            "version": 1,
            "message_type": "django",
            "fqdn": False,
        },
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "simple",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["logstash", "console"],
            "level": "INFO",
            "propagate": False,
        },
        "recommend.views": {
            "handlers": ["console"],
            "level": "DEBUG",
            "propagate": False,
        },
        "urllib3": {
            "handlers": ["console"],
            "level": "WARNING",
            "propagate": False,
        },
    },
}

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https') # swagger https 고정

SWAGGER_SETTINGS = {
    'DEFAULT_API_URL': 'https://mensclub-api.store',
    'USE_SESSION_AUTH': False,
    'VALIDATOR_URL': None,
    'SECURITY_DEFINITIONS': {
        'Bearer': {
            'type': 'apiKey',
            'in': 'header',
            'name': 'Authorization'
        }
    },
}
