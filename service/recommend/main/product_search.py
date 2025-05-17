from elasticsearch import Elasticsearch
from django.conf import settings
import os 
from dotenv import load_dotenv 

load_dotenv()
es = Elasticsearch(settings.ELASTICSEARCH_URL,
                   basic_auth=(os.getenv("ELASTICSEARCH_KEY"), os.getenv("ELASTICSEARCH_ACCESS"))
                )

def search_items_by_category(recommend_json, season, color_palette, styles):
    """각 카테고리별 아이템 검색"""
    all_items = {"상의": {}, "하의": {}, "아우터": {}, "신발": {}}

    for category, subcategories in recommend_json.items():
        if season == "여름" and category == "아우터":
            continue  # 여름에는 아우터 추천 안 함

        # 특별 케이스: 여름 하의 - 숏팬츠
        if season == "여름" and category == "하의" and "숏팬츠" in subcategories:
            # 숏팬츠 검색 최적화
            shorts_search_conditions = [
                {"match_phrase": {"sub_category": "숏팬츠"}},
                {"wildcard": {"sub_category": "*숏*"}},
                {"wildcard": {"sub_category": "*반바지*"}},
            ]

            # 각 스타일별로 다양한 숏팬츠 검색
            for style in styles:
                query = {
                    "query": {
                        "bool": {
                            "must": [
                                {"match_phrase": {"main_category": category}},
                                {
                                    "bool": {
                                        "should": shorts_search_conditions,
                                        "minimum_should_match": 1,
                                    }
                                },
                                {"match_phrase": {"style": style}},
                                {"wildcard": {"season": f"*{season}*"}},
                                {
                                    "bool": {
                                        "should": [
                                            {"match": {"color": color}}
                                            for color in color_palette
                                        ],
                                        "minimum_should_match": 1,
                                    }
                                },
                            ]
                        }
                    },
                    "size": 10,
                    "sort": [
                        {
                            "_script": {
                                "type": "number",
                                "script": "Math.random()",
                                "order": "asc",
                            }
                        }
                    ],
                }

                res = es.search(index="clothes", body=query)
                hits = res.get("hits", {}).get("hits", [])

                if hits:
                    # 숏팬츠 서브카테고리에 추가
                    for sub in subcategories:
                        if "숏" in sub or "반바지" in sub:
                            all_items[category].setdefault(sub, []).extend(
                                [hit["_source"] for hit in hits]
                            )

            # 결과가 부족하면 더 넓은 범위로 검색
            total_shorts_items = sum(
                len(items) for sub, items in all_items[category].items()
            )

            if total_shorts_items < 15:
                query = {
                    "query": {
                        "bool": {
                            "must": [
                                {"match_phrase": {"main_category": category}},
                                {
                                    "bool": {
                                        "should": [
                                            {"wildcard": {"sub_category": "*숏*"}},
                                            {"wildcard": {"sub_category": "*반바지*"}},
                                        ],
                                        "minimum_should_match": 1,
                                    }
                                },
                                {"wildcard": {"season": f"*{season}*"}},
                            ]
                        }
                    },
                    "size": 20,
                    "sort": [
                        {
                            "_script": {
                                "type": "number",
                                "script": "Math.random()",
                                "order": "asc",
                            }
                        }
                    ],
                }

                res = es.search(index="clothes", body=query)
                hits = res.get("hits", {}).get("hits", [])

                if hits:
                    # 모든 숏팬츠 서브카테고리에 추가 결과를 분배
                    extra_items = [hit["_source"] for hit in hits]
                    for sub in subcategories:
                        all_items[category].setdefault(sub, []).extend(extra_items)

            continue

        # 일반적인 경우 처리
        for sub in subcategories:
            if category == "신발":
                # 신발은 스타일 조건 없이 검색
                must_conditions = [
                    {"match_phrase": {"sub_category": sub}},
                    {"wildcard": {"season": f"*{season}*"}},
                    {
                        "bool": {
                            "should": [
                                {"match": {"color": color}} for color in color_palette
                            ],
                            "minimum_should_match": 1,
                        }
                    },
                ]
            else:
                # 의류는 스타일별로 개별 검색
                style_conditions = [
                    {"match_phrase": {"style": style}} for style in styles
                ]

                must_conditions = [
                    {"match_phrase": {"main_category": category}},
                    {"match_phrase": {"sub_category": sub}},
                    {"bool": {"should": style_conditions, "minimum_should_match": 1}},
                    {"wildcard": {"season": f"*{season}*"}},
                    {
                        "bool": {
                            "should": [
                                {"match": {"color": color}} for color in color_palette
                            ],
                            "minimum_should_match": 1,
                        }
                    },
                ]

            query = {
                "query": {"bool": {"must": must_conditions}},
                "size": 10,
                "sort": [
                    {
                        "_script": {
                            "type": "number",
                            "script": "Math.random()",
                            "order": "asc",
                        }
                    }
                ],
            }

            index_name = "shoes" if category == "신발" else "clothes"
            res = es.search(index=index_name, body=query)
            hits = res.get("hits", {}).get("hits", [])

            if hits:
                all_items[category].setdefault(sub, []).extend(
                    [hit["_source"] for hit in hits]
                )

    return all_items
