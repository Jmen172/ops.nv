import json

with open("www/thtml5/project.txt", "r", encoding="utf-8") as f:
    data = json.load(f)

print("Keys in data:", list(data.keys()))
print("Metadata:", data.get("metadata"))

# Let's find questions/items in the project
# Often Captivate exports have a 'questions' or similar key
def explore(d, path=""):
    if isinstance(d, dict):
        for k, v in d.items():
            current_path = f"{path}.{k}" if path else k
            if k == "id" or k == "type":
                print(f"{current_path}: {v}")
            if isinstance(v, (dict, list)):
                explore(v, current_path)
    elif isinstance(d, list):
        print(f"{path} is a list of length {len(d)}")
        if len(d) > 0 and isinstance(d[0], dict):
            explore(d[0], f"{path}[0]")

explore(data)
