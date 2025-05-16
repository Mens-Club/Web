from prometheus_client import CollectorRegistry, Gauge, push_to_gateway
import time 
import datetime 
from dotenv import load_dotenv
import os 
from rest_framework.response import Response
import mlflow
import json 
import pytz # 한국시간 교정 

import logging

logger = logging.getLogger(__name__)

load_dotenv() 

PUSH_GATEWAY_URL=os.getenv("PUSH_GATEWAY_URL")
os.environ["AWS_ACCESS_KEY_ID"] = os.getenv("AWS_ACCESS_KEY_ID")
os.environ["AWS_SECRET_ACCESS_KEY"] = os.getenv("AWS_SECRET_ACCESS_KEY")
os.environ["MLFLOW_S3_ENDPOINT_URL"] = os.getenv("MLFLOW_S3_ENDPOINT_URL")

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


def machine_log_metrics(image, rag_context, model_output, tag="inference_result"):
    mlflow.set_tracking_uri(os.getenv("MLFLOW_TRACKING_URI"))
    mlflow.set_experiment("MensCLUB.Inference")

    kst = datetime.datetime.now(pytz.timezone("Asia/Seoul"))
    date_tag = kst.strftime("%Y-%m-%d") + f"_{tag}"

    with mlflow.start_run(run_name=f"recommend_{date_tag}"):
        mlflow.log_param("context_snippet", rag_context)
        mlflow.log_param("date_tag", date_tag)

        # 임시 파일 생성 
        img_file = f"{date_tag}.jpg"
        json_file = f"{date_tag}.json"

        # 1. 이미지 저장 → MLflow로 업로드
        image.save(img_file, format="JPEG")
        mlflow.log_artifact(img_file, artifact_path="inputs")
        os.remove(img_file)  # 정리

        # 2. JSON 저장 → MLflow로 업로드
        with open(json_file, "w", encoding="utf-8") as f:
            json.dump(model_output, f, ensure_ascii=False, indent=2)
        mlflow.log_artifact(json_file, artifact_path="outputs")
        os.remove(json_file)  # 정리

        run_id = mlflow.active_run().info.run_id
        print(f"MLflow저장 완료: Run ID = {run_id}")
        return run_id


    