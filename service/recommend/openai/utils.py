from config.celery import app
from .recommendation_reasoning import generate_recommendation_reasoning
from recommend.models import Recommendation

@app.task
def generate_reasoning_task(recommendation_ids, combinations, season, styles, original_item_info=None):

    try:
        for idx, recommendation_id in enumerate(recommendation_ids):
            combo = combinations[idx]
            style = styles[idx % len(styles)]

            reasoning = generate_recommendation_reasoning(
                combination=combo,
                season=season,
                style=style,
                original_item=original_item_info
            )

            Recommendation.objects.filter(id=recommendation_id).update(
                reasoning_text=reasoning
            )

        return True

    except Exception as e:
        print(f"[❌ 추천 reasoning 업데이트 실패] {str(e)}")
        return False

