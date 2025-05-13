def validate_answer_categories(answer_text, valid_categories):
    matched = [category for category in valid_categories if category in answer_text]
    return matched
