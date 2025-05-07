from config.celery import app 
from .recommendation_reasoning import generate_recommendation_reasoning
from models import Recommendation

@app.task
def generate_reasoning_task(recommendation_id, combinations, season, styles, original_item_info=None):
    """
    추천 이유를 비동기적으로 생성하는 Celery 작업
    
    Args:
        recommendation_id (str): 추천 ID
        combinations (list): 생성된 상품 조합 목록
        season (str): 계절 정보
        styles (list): 스타일 목록
        original_item_info (dict): 원래 이미지의 아이템 정보
    """
    try:
        recommendation = Recommendation.objects.get(id=recommendation_id)
        
        for idx, combo in enumerate(combinations):
            # 현재 조합에 적용된 스타일 결정
            current_style = styles[idx % len(styles)]
            
            # 추천 이유 생성 (원래 아이템 정보 포함)
            reasoning_text = generate_recommendation_reasoning(
                combination=combo,
                season=season,
                style=current_style,
                original_item=original_item_info
            )
            
            # 데이터베이스에 저장
            Recommendation.objects.create(
                recommendation=recommendation,
                combination_index=idx,
                reasoning_text=reasoning_text
            )
            
        # 상태 업데이트
        recommendation.reasoning_generated = True
        recommendation.save()
        
        return True
    except Exception as e:
        print(f"추천 이유 생성 중 오류 발생: {str(e)}")
        return False