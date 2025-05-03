# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .encoding_elements import Encoding
from .connect_to_database import PGVecProcess
import requests
import time
import base64
import io
import os
from PIL import Image
from rest_framework.permissions import AllowAny
import json 

class FashionRecommendationAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        try:
            image_url = request.data.get('image_url')
            top_k = request.data.get('top_k', 1)  # 기본값 1로 설정
            
            if not image_url:
                return Response({
                    'status': 'error',
                    'message': 'image_url은 필수 항목입니다'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 1. 이미지 다운로드 (한 번만)
            
            try:
                response = requests.get(image_url, timeout=10)
                response.raise_for_status()
                base64_image = base64.b64encode(response.content).decode('utf-8')
                
            except requests.RequestException as e:
                return Response({
                'status': 'error',
                'message': f'이미지 다운로드에 실패했습니다: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)
            # 2. 임베딩용 이미지 처리
            encoder = Encoding()
            embedding = encoder.encode_image(image_url=image_url)
            
            if embedding is None:
                return Response({
                    'status': 'error',
                    'message': '이미지 인코딩에 실패했습니다'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 4. 유사 아이템 검색
            db_processor = PGVecProcess()
            cursor = db_processor.connect()
            
            if cursor is None:
                return Response({
                    'status': 'error',
                    'message': '데이터베이스 연결에 실패했습니다'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            try:
                similar_items = db_processor.similarity_search(embedding, cursor, top_k)
            finally:
                cursor.close()
                db_processor.close()
            
            # 5. 가장 유사한 아이템 하나만 선택
            most_similar_item = similar_items[0] if similar_items else None
            
            if not most_similar_item:
                return Response({
                    'status': 'error',
                    'message': '유사한 아이템을 찾을 수 없습니다'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # 6. RAG context 생성 (첫 번째 아이템만 사용)
            rag_context = self._create_rag_context(most_similar_item)
            
            # 7. 추천 생성
            recommendation = self._get_recommendation(base64_image, rag_context)
            
            return Response({
                'status': 'success',
                'recommendation': json.loads(recommendation["generated_text"].split("assistant")[-1]),
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({ 
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _create_rag_context(self, item):
        """가장 유사한 아이템으로 RAG context 생성"""
        context = []
        
        # 기본 정보
        context.append(f"카테고리: {item.get('category', '')}")
        context.append(f"서브카테고리: {item.get('sub_category', '')}")
        context.append(f"답변 내용: {item.get('answer', '')}")
        context.append(f"계절: {item.get('season', '')}")
        context.append(f"추천 내용: {item.get('recommend', '')}")
        
        # 추천 정보
        recommend_data = item.get('recommend', {})
        if recommend_data:
            for category, items in recommend_data.items():
                if items:
                    context.append(f"{category}: {', '.join(items[:3])}")
        
        return "\n".join(context)
    
    def _get_recommendation(self, base64_image, rag_context):
        """RunPod API를 통해 추천 생성"""
        api_key = os.getenv('RUNPOD_API_KEY')
        api_id = os.getenv('RUNPOD_ENDPOINT_ID')
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}'
        }
        
        prompt = f"""
        당신은 패션 추천 전문가입니다. 아래 이미지를 보고 판단하여 적절한 코디를 JSON 형식으로 추천해주세요.

        다음 참고 가이드라인을 고려하여 코디를 제안해주세요:
        {rag_context}

        이미지를 참고하여 다음 형식에 맞게 추천해주세요:
        {{ "answer": ..., "recommend": {{ "상의": [...], "아우터": [...], "하의": [...], "신발": [...] }} }}

        *주의*:
        1) `answer` 문장에 반드시 '해당 상품은 데님 팬츠로 보이며 봄에 잘 어울리는 스타일입니다'처럼 계절과 아이템 카테고리를 언급할 것.
        2) `recommend` 내 각 카테고리별로 최소 3개의 아이템을 제시할 것.
        3) 이미지에 등장하는 주요 아이템은 해당 카테고리에서 제외하고, 나머지 카테고리는 모두 추천할 것.
        4) `season`, `sub_category`, `main_category` 요소들은 recommend에 추가하지 말아야합니다.
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
        
        print(rag_context)
        
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
            raise Exception(f"API 요청 실패: {response.status_code}")