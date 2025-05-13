import json

def create_rag_context(item):
    """가장 유사한 아이템으로 RAG context 생성 (JSON 형태)"""
    context_data = {
        # "category": item.get('category', ''),
        # "sub_category": item.get('sub_category', ''),
        "answer": item.get('answer', ''),
        "season": item.get('season', ''),
        "recommend": item.get('recommend', '')
    }
    
    # JSON 문자열로 변환 (들여쓰기 추가하여 가독성 향상)
    context_json = json.dumps(context_data, ensure_ascii=False, indent=2)
    
    return context_json