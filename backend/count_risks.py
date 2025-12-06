import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "data", "workers.json")

if not os.path.exists(DATA_FILE):
    print("No workers file found!")
    exit(1)

with open(DATA_FILE, 'r', encoding='utf-8') as f:
    workers = json.load(f)

high = 0
medium = 0
low = 0

print(f"Total Workers: {len(workers)}")
print("-" * 30)
print(f"{'Name':<10} | {'Risk':<6} | {'Level'}")
print("-" * 30)

for w in workers:
    prob = w.get("risk_prob", 0)
    name = w.get("name", "Unknown")
    
    if prob >= 50:
        high += 1
        level = "High"
    elif prob >= 20:
        medium += 1
        level = "Medium"
    else:
        low += 1
        level = "Low"
        
    print(f"{name:<10} | {prob:5.1f}% | {level}")

print("-" * 30)
print(f"High Risk (>=50%): {high}명")
print(f"Medium Risk (20-50%): {medium}명")
print(f"Low Risk (<20%): {low}명")
