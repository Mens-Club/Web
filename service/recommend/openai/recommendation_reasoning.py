from openai import OpenAI
import os 

os.getenv('OPENAI_API_KEY')
client = OpenAI()

def generate_recommendation_reasoning(combination, season, style, original_item=None):
    """
    OpenAI API를 사용하여 패션 조합에 대한 추천 이유 생성
    
    Args:
        combination (dict): 추천된 의류 조합 (상의, 하의, 아우터, 신발)
        season (str): 계절 정보
        style (str): 스타일 정보 (미니멀, 캐주얼 등)
        original_item (dict, optional): 원래 이미지에 있던 주요 아이템 정보
    
    Returns:
        str: 생성된 추천 이유
    """
   
    
    # 조합에서 필요한 정보 추출
    top = combination.get('상의', {})
    bottom = combination.get('하의', {})
    outer = combination.get('아우터', {})
    shoes = combination.get('신발', {})
    
    # 상품 정보 구성
    items_info = []
    
    # 원래 이미지의 아이템 정보 추가
    if original_item:
        base = f"기존 아이템: {original_item.get('category', '')} - {original_item.get('sub_category', '')}"
        color = original_item.get("color")
        style = original_item.get("style")

        if color:
            base += f", 색상: {color}"
        if style:
            base += f", 스타일: {style}"
        
        items_info.append(base)
        
    # 조합 아이템 정보 추가
    if top:
        items_info.append(f"상의: {top.get('goods_name', '')}, 색상: {top.get('color', '')}, 스타일: {top.get('style', '')}")
    if bottom:
        items_info.append(f"하의: {bottom.get('goods_name', '')}, 색상: {bottom.get('color', '')}, 스타일: {bottom.get('style', '')}")
    if outer:
        items_info.append(f"아우터: {outer.get('goods_name', '')}, 색상: {outer.get('color', '')}, 스타일: {outer.get('style', '')}")
    if shoes:
        items_info.append(f"신발: {shoes.get('goods_name', '')}, 색상: {shoes.get('color', '')}, 스타일: {shoes.get('style', '')}")
    
    items_text = "\n".join(items_info)
    
    # 프롬프트 구성
    prompt = f"""
    당신은 패션 전문가입니다. 다음 의류 조합의 추천 이유를 설명해주세요.
    
    계절: {season}
    스타일: {style}
    
    조합 아이템:
    {items_text}
    
    이 조합이 왜 어울리는지, 다음 관점에서 설명해주세요:
    1. 계절 적합성 - {season} 계절에 어떻게 적합한지
    2. 스타일 통일성 - {style} 스타일을 어떻게 표현하는지
    3. 착용 시 기대효과 - 이 조합을 입었을 때의 인상
    
    150~200자 내로 간결하게 설명해주세요.
    """
    
    # API 호출
    response = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[
            {"role": "system", "content": "당신은 패션 전문가로서 패션 코디네이션의 조화와 스타일을 자연스럽고 전문적으로 설명합니다."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=300,
        temperature=0.7
    )
    
    # 결과 추출
    reasoning = response.choices[0].message.content.strip()
    return reasoning