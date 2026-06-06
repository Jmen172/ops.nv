import json

with open("www/thtml5/project.txt", "r", encoding="utf-8") as f:
    data = json.load(f)

# Let's search for keys containing "correct" or "answer" or "interaction"
found_keys = set()
def find_keys(d, path=""):
    if isinstance(d, dict):
        for k, v in d.items():
            if "answer" in k.lower() or "correct" in k.lower() or "question" in k.lower() or "interaction" in k.lower():
                found_keys.add(f"{path}.{k}" if path else k)
            explore(v, f"{path}.{k}" if path else k)
    elif isinstance(d, list):
        for i, item in enumerate(d):
            explore(item, f"{path}[{i}]")

def explore(v, p):
    if isinstance(v, (dict, list)):
        find_keys(v, p)

find_keys(data)
print("Found keys related to answers/questions/interactions:")
for fk in sorted(list(found_keys))[:50]:
    print(fk)
