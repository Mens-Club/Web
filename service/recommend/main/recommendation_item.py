import os
import time
import requests

def get_recommendation(base64_image, rag_context):
    """RunPod API를 통해 추천 생성"""
    api_key = os.getenv('RUNPOD_API_KEY')
    api_id = os.getenv('RUNPOD_ENDPOINT_ID')
    
    if not api_key or not api_id:
        raise ValueError("API 키 또는 엔드포인트 ID가 설정되지 않았습니다.")
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }
    
    prompt = f"""
    당신은 패션 추천 전문가입니다. 아래 이미지를 보고 판단하여 적절한 코디를 JSON 형식으로 추천해주세요.

    이미지를 참고하여 다음 형식에 맞춰 출력해주세요:
    {{ 
    "answer": "...", 
    "recommend": {{ 
        "상의": [...], 
        "아우터": [...], 
        "하의": [...], 
        "신발": [...] 
    }} 
    }}

    주의사항:
    1) "answer" 문장에 반드시 '해당 상품은 데님 팬츠로 보이며 봄에 잘 어울리는 스타일입니다'처럼 **계절**과 **아이템 카테고리**를 명시하세요.
    2) "recommend"의 각 카테고리에는 **최소 3개의 아이템**을 제시해야 합니다.
    3) 이미지에 나타난 **주요 아이템은 해당 카테고리에서 제외**하고, 나머지 카테고리에서는 추천을 제공합니다.
    4) "recommend" 항목에는 **season**, **sub_category**, **main_category** 등의 필드를 추가하지 마세요.
    5) 참고 가이드라인에서 특정 카테고리가 빈 리스트([])일 경우, **임의로 항목을 추가하지 말고 빈 리스트 그대로 출력**해야 합니다.
    6) JSON 외의 설명은 출력하지 마세요.
    """
    
    payload = {
        'input': {
            "image_base64": base64_image,
            "rag_context": rag_context,
            "prompt": prompt,
            "temperature": 0.7,
            "max_tokens": 512
        }
    }
    
    url = f"https://api.runpod.ai/v2/{api_id}/run"
    response = requests.post(url, headers=headers, json=payload)
    
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
                    return status_data["output"]
                elif status_data["status"] in ["FAILED", "CANCELLED"]:
                    raise Exception(f"Task {status_data['status']}")
                
                time.sleep(2)
    else:
        raise Exception(f"API 요청 실패: {response.status_code}, 상세내용: {response.text}")