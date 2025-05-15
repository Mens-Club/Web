from prometheus_client import CollectorRegistry, Gauge, push_to_gateway
import time 
from dotenv import load_dotenv
import os 
from rest_framework.response import Response

import logging

logger = logging.getLogger(__name__)

load_dotenv() 

PUSH_GATEWAY_URL=os.getenv("PUSH_GATEWAY_URL")

def push_fashion_recommendation_metrics(success: bool, duration: float):
    registry = CollectorRegistry()

    g_success = Gauge('fashion_recommend_success', '패션 추천 요청의 성공 여부 (1: 성공, 0: 실패)', registry=registry)
    g_duration = Gauge('fashion_recommend_duration_seconds', '패션 추천 처리에 걸린 시간(초)', registry=registry)
    g_timestamp = Gauge('fashion_recommend_last_run_timestamp', '마지막 패션 추천 실행 시간 (UNIX timestamp)', registry=registry)

    g_success.set(1 if success else 0)
    g_duration.set(duration)
    g_timestamp.set(time.time())
    
    try:
        push_to_gateway(PUSH_GATEWAY_URL, job='fashion_recommend_api', registry=registry)
        logger.info("메트릭 푸시 성공")
    except Exception as e:
        logger.warning(f"메트릭 푸시 실패: {e}")

def fail_response(message: str, start_time: float, status: int = 500, extra: dict = None):
    push_fashion_recommendation_metrics(False, time.time() - start_time)
    base = {"status": "error", "message": message}
    if extra:
        base.update(extra)
    return Response(base, status=status)