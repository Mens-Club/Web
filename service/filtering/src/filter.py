# 컬러 팔레트 예시 (키는 메인 색상, 값은 어울리는 색상들)
COLOR_PALETTE_BY_SEASON = {
    "봄": ['오트밀', '아이보리', '화이트', '블랙', '베이지', '네이비', "흑청", "진청", "연청", "중청"],
    "여름": ['스카이블루', '네이비', '화이트', '블랙', "연청", "중청", "흑청"],
    "가을": ['화이트', '블랙', '버건디', '오트밀', '아이보리', '카키', '베이지', '브라운', "흑청", "진청", "중청"],
    "겨울": ['화이트', '그레이', '블랙', '네이비', '카키', "흑청", "진청", "중청"]
}

import pymysql
import random

def get_db_connection():
    return pymysql.connect(
        host='172.16.221.208',
        port=3300,
        user='HYEONG',
        password='1234',
        db='Mensclub',
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )

def filter_items(recommend_json: dict, style: str, season: str):
    connection = get_db_connection()
    cursor = connection.cursor()

    results = {"상의": {}, "하의": {}, "신발": {}, "아우터": {}}
    color_palette = COLOR_PALETTE_BY_SEASON.get(season, [])

    for category, subcategories in recommend_json.items():
        if season == "여름" and category == "아우터":
            continue  # 여름엔 아우터 없음

        if not subcategories:
            print(f"Skipping {category} due to empty subcategories")
            results[category] = {}
            continue

        # 세부 카테고리별로 개별 쿼리 실행
        results[category] = {sub: [] for sub in subcategories}
        for sub_category in subcategories:
            if category == '신발':
                sql = f"""
                    SELECT * FROM shoes_test2
                    WHERE sub_category = %s
                    AND season LIKE %s
                    AND color IN ({','.join(['%s'] * len(color_palette))})
                    ORDER BY RAND() LIMIT 1;
                """
                params = [sub_category, f"%{season}%"] + color_palette
                cursor.execute(sql, params)
                items = cursor.fetchall()
                print(f"Found {len(items)} items for {category} - {sub_category}")
                results["신발"][sub_category] = items
            else:
                sql = f"""
                    SELECT * FROM mens_table_refine
                    WHERE main_category=%s
                    AND sub_category = %s
                    AND style=%s
                    AND season LIKE %s
                    AND color IN ({','.join(['%s'] * len(color_palette))})
                    ORDER BY RAND() LIMIT 1;
                """
                params = [category, sub_category, style, f"%{season}%"] + color_palette
                cursor.execute(sql, params)
                items = cursor.fetchall()
                print(f"Found {len(items)} items for {category} - {sub_category}")
                results[category][sub_category] = items

    cursor.close()
    connection.close()
    return results

def generate_outfit_combinations(recommend_json: dict, items_by_category: dict, max_count=3):
    # 각 카테고리의 세부 카테고리 리스트 가져오기
    tops_subcategories = recommend_json.get("상의", [])
    bottoms_subcategories = recommend_json.get("하의", [])
    outers_subcategories = recommend_json.get("아우터", [])
    shoes_subcategories = recommend_json.get("신발", [])

    # 가장 긴 세부 카테고리 리스트의 길이를 기준으로 조합 생성
    max_length = max(
        len(tops_subcategories),
        len(bottoms_subcategories),
        len(outers_subcategories),
        len(shoes_subcategories)
    )

    results = []
    for i in range(min(max_length, max_count)):
        combo = {"상의": None, "하의": None, "아우터": None, "신발": None}
        
        # 각 카테고리의 i번째 세부 카테고리에서 아이템 선택
        for category, subcategories in [
            ("상의", tops_subcategories),
            ("하의", bottoms_subcategories),
            ("아우터", outers_subcategories),
            ("신발", shoes_subcategories)
        ]:
            if i < len(subcategories) and subcategories[i] in items_by_category[category]:
                items = items_by_category[category][subcategories[i]]
                if items:  # 아이템이 존재하면 첫 번째 아이템 선택 (LIMIT 1로 0 또는 1개)
                    combo[category] = items[0]
                    print(f"Selected item for {category} - {subcategories[i]}")
        
        # 최소 하나의 아이템이 있는 경우에만 조합 추가
        if any(combo.values()):
            results.append(combo)
            print(f"Added combination {i+1}: {combo}")

    print(f"Generated {len(results)} combinations")
    return results