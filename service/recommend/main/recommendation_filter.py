from .categorical_data import CATEGORY

def filter_recommendation_by_season(recommendation_json, season):
    """계절별 허용된 아이템으로 추천 결과 필터링"""
    # 카테고리 데이터 가져오기
    allowed_items = CATEGORY.get(season, {})
    filtered_recommend = {}
    
    for category, items in recommendation_json.get("recommend", {}).items():
        allowed = allowed_items.get(category, [])
        
        # 빈 리스트인 경우 그대로 유지
        if not items:
            filtered_recommend[category] = []
            continue
        
        # 허용 목록과 비교하여 필터링
        filtered_items = []
        for item in items:
            # 허용 목록에 정확히 일치하는 항목이 있는지 확인
            if item in allowed:
                filtered_items.append(item)
                continue
                
            # 부분 일치하는 항목이 있는지 확인 (더 유연한 매칭)
            for allowed_item in allowed:
                if item in allowed_item or allowed_item in item:
                    filtered_items.append(allowed_item)  # 허용된 정확한 명칭으로 대체
                    break
        
        # 여름 하의 - 숏팬츠 특별 처리
        if season == "여름" and category == "하의" and len(allowed) == 1 and allowed[0] == "숏팬츠":
            # 동일 아이템 3개 반환
            filtered_items = ["숏팬츠"] * 3
        else:
            # 중복 제거
            filtered_items = list(dict.fromkeys(filtered_items))
            
            # 필터링 후 항목이 3개 미만이면 허용 목록에서 추가
            if len(filtered_items) < 3 and allowed:
                for candidate in allowed:
                    if candidate not in filtered_items:
                        filtered_items.append(candidate)
                    if len(filtered_items) == 3:
                        break
        
        filtered_recommend[category] = filtered_items[:3]
    
    return {
        "answer": recommendation_json.get("answer", ""),
        "recommend": filtered_recommend
    }