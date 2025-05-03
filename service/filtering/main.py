from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json
import random
from src.call import get_fashion_recommendation
from src.answer import split_answer_recommend
from src.filter import filter_items, generate_outfit_combinations
from dotenv import load_dotenv
import os
load_dotenv()

app = FastAPI()

class OutfitRequest(BaseModel):
    image_id: str

api_id = os.getenv("RUNPOD_API_ID")
api_key = os.getenv("RUNPOD_API_KEY")

@app.post("/generate-outfit")
def generate_outfit(request: OutfitRequest):
    try:
        rp = get_fashion_recommendation(request.image_id, api_id, api_key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RunPod 호출 오류: {e}")
    
    # answer.py로 텍스트 파싱
    result = split_answer_recommend(rp)
    answer = result.get("answer", "")
    season = result.get("season", "")
    recommend = result.get("recommend", "{}")

    # Debug: Print values before filtering
    print(f"Main - Answer: {answer}")
    print(f"Main - Season: {season}")
    print(f"Main - Recommend: {recommend}")

    # style 랜덤 선택
    style = random.choice(["캐주얼", "미니멀"])

    # filter.py로 조합 생성
    filtered = filter_items(recommend, style, season)
    combos = generate_outfit_combinations(recommend, filtered)

    return {"answer": answer, "combinations": combos}

@app.get("/health")
def health_check():
    return {"status": "ok"}