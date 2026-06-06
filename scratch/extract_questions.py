import json

with open("www/thtml5/js/test.json", "r") as f:
    questions = json.load(f)

# Filter out directions, keep only active questions (q1 to q100)
active_questions = [q for q in questions if q.get("id", "").startswith("q")]

# Sort by number in id
active_questions.sort(key=lambda q: int(q["id"][1:]))

# Also load transcriptions if available
try:
    with open("www/thtml5/viera/transcriptions.json", "r") as f:
        transcriptions = json.load(f)
except Exception:
    transcriptions = {}

with open("scratch/formatted_questions.txt", "w") as f:
    for q in active_questions:
        qid = q["id"]
        qtype = q["type"]
        f.write(f"=== {qid} ({qtype}) ===\n")
        if qid in transcriptions:
            f.write(f"Transcript: {transcriptions[qid]}\n")
        f.write(f"Question: {q.get('question', '')}\n")
        f.write("Options:\n")
        for opt in q.get("options", []):
            f.write(f"  - {opt}\n")
        if "image" in q:
            f.write(f"Image: {q['image']}\n")
        if "audio" in q:
            f.write(f"Audio: {q['audio']}\n")
        f.write("\n")

print(f"Dumped {len(active_questions)} questions to scratch/formatted_questions.txt")
