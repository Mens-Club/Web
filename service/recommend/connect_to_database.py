import psycopg2 
from dotenv import load_dotenv 
import os 
import json 
import numpy as np 

load_dotenv() 


class PGVecProcess:
    
    def __init__(self, params=None):
        """
        PGVector 처리를 위한 클래스 초기화
        
        :param params: 데이터베이스 연결 파라미터
        """
        self.params = params or {
            "dbname": os.getenv("POSTGRES_DATABASE"),
            "user": os.getenv("POSTGRES_USER"),
            "password": os.getenv("POSTGRES_PASSWORD"),
            "host": os.getenv("POSTGRES_HOST"),
            "port" : os.getenv("POSTGRES_PORT")
        }
    def similarity_search(self, embedding, cursor, top_k=5):
        """
        주어진 임베딩과 가장 유사한 벡터 검색
        
        :param embedding: 검색할 임베딩 벡터
        :param cursor: 데이터베이스 커서
        :param top_k: 반환할 최상위 유사 항목 수
        :return: 유사한 항목 리스트
        """
        try:
            # numpy 배열을 리스트로 변환
            if isinstance(embedding, np.ndarray):
                embedding = embedding.tolist()
                
            # 유사도 검색 쿼리
            query = """
            SELECT 
                source_url, 
                embedding, 
                season,
                category,
                sub_category,
                color,
                answer,
                recommend,
                embedding <-> %s::vector AS distance
            FROM fashion_recommendations
            ORDER BY distance
            LIMIT %s
            """
            
            # 쿼리 실행
            cursor.execute(query, (embedding, top_k))
            
            # 결과 변환
            results = []
            for row in cursor.fetchall():
                # recommend 필드 안전하게 처리
                recommend_data = {}
                if row[7]:
                    if isinstance(row[7], str):
                        try:
                            recommend_data = json.loads(row[7])
                        except json.JSONDecodeError:
                            recommend_data = {"error": "잘못된 JSON 형식"}
                    elif isinstance(row[7], dict):
                        recommend_data = row[7]  
                
                distance = float(row[8])
                max_distance = 10.0
                similarity_percentage = max(0, 100 * (1 - distance / max_distance))

                results.append({
                    'source_url': row[0],
                    'embedding': row[1],
                    'season': row[2],
                    'category': row[3],
                    'sub_category': row[4],
                    'color': row[5],
                    'answer': row[6],
                    'recommend': recommend_data,
                    'distance': row[8],
                    'similarity': round(similarity_percentage, 2)
                })
            
            return results
        
        except Exception as e:
            print(f"유사도 검색 중 오류 발생: {e}")
            import traceback
            traceback.print_exc()  # 자세한 오류 추적
            return []
    