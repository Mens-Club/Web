import os
import sys
import logging  # 추가

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    
    # 여기에 로깅 코드 추가
    logger = logging.getLogger(__name__)
    logger.info("Django 애플리케이션이 시작되었습니다")
    
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()