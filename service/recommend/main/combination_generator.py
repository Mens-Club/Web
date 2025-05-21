import random


def generate_proper_combinations(
    recommend_json, items_by_category, styles, max_count=3
):
    """각 조합이 요청된 서브카테고리를 순차적으로 사용"""
    combinations = []
    used_items = {category: [] for category in ["상의", "하의", "아우터", "신발"]}

    for combo_id in range(max_count):
        current_style = styles[combo_id % len(styles)]
        combo = {"상의": None, "하의": None, "아우터": None, "신발": None}

        for category, subcategories in recommend_json.items():
            if not subcategories:
                continue

            # 특별 케이스: 여름 하의 - 숏팬츠
            if category == "하의" and "숏팬츠" in subcategories:
                # 모든 숏팬츠 아이템 수집
                shorts_items = []
                for sub_cat in items_by_category.get(category, {}):
                    if "숏" in sub_cat or "반바지" in sub_cat:
                        shorts_items.extend(items_by_category[category][sub_cat])

                if shorts_items:
                    # 이미 사용하지 않은 아이템 필터링
                    available_items = [
                        item
                        for item in shorts_items
                        if item.get("id") not in used_items[category]
                    ]

                    if available_items:
                        selected_item = random.choice(available_items)
                        combo[category] = selected_item
                        used_items[category].append(selected_item.get("id"))
                    elif shorts_items:  # 모든 아이템이 이미 사용됐으면 중복 허용
                        selected_item = random.choice(shorts_items)
                        combo[category] = selected_item
                continue

            # 일반적인 처리
            if combo_id < len(subcategories):
                sub = subcategories[combo_id]
            else:
                # 서브카테고리가 충분하지 않으면 첫 번째 것을 재사용
                sub = subcategories[0]

            # 해당 서브카테고리의 아이템 찾기
            if category == "신발":
                items = items_by_category.get(category, {}).get(sub, [])
                if items:
                    # 사용되지 않은 아이템 선택
                    available_items = [
                        item
                        for item in items
                        if item.get("id") not in used_items[category]
                    ]

                    if available_items:
                        selected_item = random.choice(available_items)
                        combo[category] = selected_item
                        used_items[category].append(selected_item.get("id"))
                    elif items:  # 중복 허용
                        combo[category] = random.choice(items)
            else:
                # 현재 스타일과 매칭
                matching_items = []
                if sub in items_by_category.get(category, {}):
                    for item in items_by_category[category][sub]:
                        if (
                            item.get("style") == current_style
                            and item.get("id") not in used_items[category]
                        ):
                            matching_items.append(item)

                # 스타일 제한 없이 찾기
                if not matching_items and sub in items_by_category.get(category, {}):
                    matching_items = [
                        item
                        for item in items_by_category[category][sub]
                        if item.get("id") not in used_items[category]
                    ]

                if matching_items:
                    selected_item = random.choice(matching_items)
                    combo[category] = selected_item
                    used_items[category].append(selected_item.get("id"))
                elif (
                    sub in items_by_category.get(category, {})
                    and items_by_category[category][sub]
                ):
                    # 중복 허용
                    combo[category] = random.choice(items_by_category[category][sub])

        combinations.append(combo)

    return combinations
