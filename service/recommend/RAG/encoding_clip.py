import requests
import base64
import io
import os 
from dotenv import load_dotenv 
import time 

load_dotenv()

def get_clip_embedding(pil_image):
    
    api_key = os.getenv('RUNPOD_API_KEY')
    api_id = os.getenv('ENCODING_ENDPOINT_ID')
    
    buffer = io.BytesIO()
    pil_image.save(buffer, format="JPEG")
    base64_image = base64.b64encode(buffer.getvalue()).decode("utf-8")

    # 요청 payload
    payload = {
        "input": {
            "image_base64": base64_image
        }
    }

    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }

    url = f"https://api.runpod.ai/v2/{api_id}/run"
    response = requests.post(url, json=payload, headers=headers)
    
    if response.status_code == 200:
        result = response.json()
                    
        # 동기 요청
        if "output" in result:
            return result["output"]
        
        # 비동기 요청
        elif "id" in result:
            task_id = result["id"]
            status_url = f"https://api.runpod.ai/v2/{api_id}/status/{task_id}"
            
            while True:
                status_response = requests.get(status_url, headers=headers)
                status_data = status_response.json()
                
                if status_data["status"] == "COMPLETED":
                    return status_data["output"]["embedding"]
                elif status_data["status"] in ["FAILED", "CANCELLED"]:
                    raise Exception(f"Task {status_data['status']}")
                
                time.sleep(2)
    else:
        raise Exception(f"API 요청 실패: {response.status_code}, 상세내용: {response.text}")
