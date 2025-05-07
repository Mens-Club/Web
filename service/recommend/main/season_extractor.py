def extract_season_from_text(answer_text, default_season="봄"):
    """텍스트에서 계절 정보 추출"""
    season = None
    for possible_season in ["봄", "여름", "가을", "겨울"]:
        if possible_season in answer_text:
            season = possible_season
            break
            
    if not season:
        # 계절을 찾지 못했다면 기본값 설정
        season = default_season
    
    return season