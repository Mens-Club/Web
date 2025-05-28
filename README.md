#  `Men's CLUB` 메인 서버 

> AI 패션 추천 서비스의 웹 애플리케이션

## 서비스 아키텍처

### Backend (Django)
- **API 서버**: Django REST Framework 기반 RESTful API
- **비동기 처리**: Celery를 활용한 백그라운드 작업 큐
- **데이터베이스**: PostgreSQL 연동
- **AI 모델 연동**: RunPod API 호출 및 결과 처리

### Frontend (React PWA)
- **PWA**: Progressive Web App으로 모바일 최적화
- **상태 관리**: Redux Toolkit으로 전역 상태 관리
- **스타일링**: Tailwind CSS를 활용한 반응형 디자인
- **실시간 업데이트**: 비동기 결과를 실시간으로 UI 반영

### Infrastructure
- **Reverse Proxy**: Nginx를 통한 요청 라우팅
- **컨테이너화**: Docker 기반 마이크로서비스 아키텍처

## 시스템 아키텍처 
![image](https://github.com/user-attachments/assets/4d5e2549-a724-4f9e-831d-53076d611144)


## 기술 스택

### Backend
```
Django 
Django REST Framework
Celery (Redis)
PostgreSQL
```

### Frontend
```
React (PWA)
Redux Toolkit
Axios
```

### Infrastructure
```
Nginx (Reverse Proxy)
Docker & Docker Compose
```

## 프로젝트 구조

```
├── mensclub-pwa/              # React PWA 프론트엔드
│   ├── Dockerfile.React       # React 컨테이너 설정
│   ├── frontserver.docker-compose.yaml
│   ├── package.json
│   ├── public/
│   └── src/                   # React 소스 코드
├── nginx/                     # Nginx 리버스 프록시
│   ├── Dockerfile.proxy
│   ├── nginx.conf             # Nginx 설정
│   └── proxy.server.docker-compose.yaml
├── service/                   # Django 백엔드
│   ├── clothes/               # 의류 관련 앱
│   ├── config/                # Django 설정
│   ├── members/               # 사용자 관리 앱
│   ├── Picked/                # 추천 결과 관리 앱
│   ├── recommend/             # 추천 시스템 앱
│   ├── Dockerfile.django      # Django 컨테이너 설정
│   ├── manage.py
│   ├── requirements.txt
│   └── web.docker-compose.yaml
└── README.md
```

##  실행 방법

### Docker Compose로 전체 서비스 실행
```bash
# Nginx 프록시 서버 실행
cd nginx
docker-compose -f proxy.server.docker-compose.yaml up -d

# Django 백엔드 실행
cd service
docker-compose -f web.docker-compose.yaml up -d

# React PWA 프론트엔드 실행
cd mensclub-pwa
docker-compose -f frontserver.docker-compose.yaml up -d
```

### 개발 환경 실행
```bash
# Backend
cd service
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend
cd mensclub-pwa
npm install
npm start
```


