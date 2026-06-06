import json

with open("www/thtml5/project.txt", "r", encoding="utf-8") as f:
    data = json.load(f)

extracted = []
for item in data.get("contentStructure", []):
    roles = item.get("roles", {})
    question_role = roles.get("question", {})
    if question_role:
        interaction_id = question_role.get("interactionId")
        correct_answers = question_role.get("correctAnswers")
        item_id = item.get("id")
        if interaction_id:
            extracted.append({
                "item_id": item_id,
                "interaction_id": interaction_id,
                "correct_answers": correct_answers
            })

print(f"Extracted {len(extracted)} questions with interaction IDs:")
for q in extracted[:120]:
    print(q)
