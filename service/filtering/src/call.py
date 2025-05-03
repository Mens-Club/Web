import requests
import base64
import json
import time
import pymysql
from dotenv import load_dotenv
import os
load_dotenv()


# 이미지를 Base64로 변환
def image_to_base64(image_path):
    if image_path.startswith('http'):
        # URL인 경우 먼저 다운로드
        response = requests.get(image_path)
        response.raise_for_status()
        img_data = response.content
    else:
        # 로컬 파일 경로인 경우
        with open(image_path, "rb") as image_file:
            img_data = image_file.read()
    
    return base64.b64encode(img_data).decode('utf-8')

#DB에서 image url 가져오기기
def get_image_url_from_db(image_id: str) -> str:
    conn = pymysql.connect(
        host=os.getenv("MYSQL_HOST"),
        port=os.getenv('MYSQL_PORT'),
        user=os.getenv('MYSQL_USER'),
        password=os.getenv('MYSQL_PASSWORD'),
        db=os.getenv('MYSQL_DB'),
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )
    try:
        with conn.cursor() as cursor:
            sql = "SELECT file_data FROM save_image_test WHERE id = %s"
            cursor.execute(sql, (image_id,))
            row = cursor.fetchone()
            if row:
                return row[0]
            else:
                raise ValueError(f"No image found for id {image_id}")
    finally:
        conn.close()

# API 호출
def get_fashion_recommendation(image_path, api_id, api_key):
    url = get_image_url_from_db(image_path)
    base64_image = image_to_base64(url)
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }
    
    # 패션 추천 프롬프트
    prompt = (
        "당신은 패션 추천 전문가입니다. 아래 이미지를 보고 판단하여 적절한 코디를 JSON 형식으로 추천해주세요.\n\n"
        "이미지를 참고하여 다음 형식에 맞게 추천해주세요:\n"
        '{ "answer": ..., "recommend": { "상의": [...], "아우터": [...], "하의": [...], "신발": [...] } }\n\n'
        "*주의*: \n"
        "1) `answer` 문장에 반드시 '봄에 잘 어울리는 스타일입니다'처럼 계절을 언급할 것.\n"
        "2) `recommend` 내 각 카테고리별로 최소 3개의 아이템을 제시할 것.\n"
        "3) 이미지에 등장하는 주요 아이템은 해당 카테고리에서 제외하고, 나머지 카테고리는 모두 추천할 것."
    )
    
    payload = {
        'input': {
            "image_base64": base64_image,
            "prompt": prompt,
            "temperature": 0.7,
            "max_tokens": 512
        }
    }
    
    url = f"https://api.runpod.ai/v2/{api_id}/run"
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code == 200:
        result = response.json()
        
        # 동기 요청의 경우 바로 결과가 반환됨
        if "output" in result:
            return result
        
        # 비동기 요청의 경우 작업 ID가 반환되고 결과를 폴링해야 함
        elif "id" in result:
            task_id = result["id"]
            status_url = f"https://api.runpod.ai/v2/{api_id}/status/{task_id}"
            
            while True:
                status_response = requests.get(status_url, headers=headers)
                status_data = status_response.json()
                
                if status_data["status"] == "COMPLETED":
                    return status_data
                elif status_data["status"] in ["FAILED", "CANCELLED"]:
                    return {"error": f"Task {status_data['status']}", "details": status_data}
                
                time.sleep(2)  # 폴링 간격
    else:
        return {"error": f"API 요청 실패: {response.status_code}", "details": response.text}