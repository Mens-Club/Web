from .categorical_data import CATEGORY

def filter_recommendation_by_season(recommendation_json, season):
    allowed_items = CATEGORY.get(season, {})
    filtered_recommend = {}

    for category in recommendation_json.get("recommend", {}):
        allowed = allowed_items.get(category, [])
        items = recommendation_json["recommend"].get(category, [])
        filtered_items = []

        # 빈 리스트인 경우에도 allowed 기준으로 3개 채움
        if not items:
            filtered_items = allowed[:3] if allowed else []
        else:
            for item in items:
                if item in allowed:
                    filtered_items.append(item)
                    continue
                for allowed_item in allowed:
                    if item in allowed_item or allowed_item in item:
                        filtered_items.append(allowed_item)
                        break

            filtered_items = list(dict.fromkeys(filtered_items))

            if len(filtered_items) < 3 and allowed:
                for candidate in allowed:
                    if candidate not in filtered_items:
                        filtered_items.append(candidate)
                    if len(filtered_items) == 3:
                        break

        # 여름 하의 - 숏팬츠 특별 처리
        if season == "여름" and category == "하의" and allowed == ["숏팬츠"]:
            filtered_items = ["숏팬츠"] * 3

        filtered_recommend[category] = filtered_items[:3]

    return {
        "answer": recommendation_json.get("answer", ""),
        "recommend": filtered_recommend
    }
