import json
import re

def split_answer_recommend(text: dict):
    # RunPod 응답에서 generated_text 추출
    raw_text = text["output"]["generated_text"]

    # assistant 구분자 이후만 취한다
    json_str = raw_text.split("assistant\n\n", 1)[-1].strip().replace('\r', '\n')

    print(f"Cleaned input text: {json_str!r}")

    # 3) 중괄호 개수 보정
    opens = json_str.count('{')
    closes = json_str.count('}')
    if closes < opens:
        json_str += '}' * (opens - closes)

    # 4) (선택) {…} 블록만 뽑기
    m = re.search(r'(\{.*\})', json_str, re.DOTALL)
    cleaned_text = m.group(1) if m else json_str

    # 이제 안전하게 JSON 파싱
    try:
        data = json.loads(cleaned_text)
        answer = data.get("answer", "")
        recommend = data.get("recommend", {})
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {e}")
        print(f"Error context: {cleaned_text[:50]!r}...")  # Debug: Show start of problematic text
        answer, recommend = "", {}

    # 계절 추출
    season = ""
    for s in ["봄","여름","가을","겨울"]:
        if s in answer:
            season = s
            break

    return {"answer": answer, "season": season, "recommend": recommend}
