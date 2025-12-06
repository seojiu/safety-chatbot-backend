import json
import os
import uuid
import joblib
import pandas as pd
import numpy as np

# 1. Setup Paths & Models
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "data", "workers.json")
MODEL_DIR = os.path.join(BASE_DIR, "models")

print("Loading models...")
binary_model = joblib.load(os.path.join(MODEL_DIR, "accident_binary_model_final_recall.pkl"))
type_model = joblib.load(os.path.join(MODEL_DIR, "accident_type_model_final_recall.pkl"))
BINARY_FEATURES = list(getattr(binary_model, "feature_names_in_", []))

# 2. Define Prediction Function (Logic from app.py)
LOW_RISK_THRESHOLD = 20.0

def predict_worker_risk(profile: dict):
    # Feature Mapping for Model Compatibility
    # The model expects 'physical_risk' and 'physical_risk.1' instead of 8 and 9 in some versions,
    # or just uses them if trained that way. 
    # Based on app.py, we need to map 8->physical_risk and 9->physical_risk.1
    
    profile_copy = profile.copy()
    if "physical_risk8" in profile_copy:
        profile_copy["physical_risk"] = profile_copy["physical_risk8"]
    if "physical_risk9" in profile_copy:
        profile_copy["physical_risk.1"] = profile_copy["physical_risk9"]

    df = pd.DataFrame([profile_copy], columns=BINARY_FEATURES).fillna(0)
    prob = float(binary_model.predict_proba(df)[0, 1] * 100.0)
    
    if prob >= LOW_RISK_THRESHOLD:
        typ = int(type_model.predict(df)[0])
        type_label = "업무상 질병" if typ == 1 else "업무상 사고"
    else:
        type_label = "예측 없음"
    
    return prob, type_label

# 3. New High Risk Data provided by User
new_data_raw = {
    "근로자4": {
        "gender": 1, "age": 44, "age_group": 40, "education": 4.0, "employment_type": 1.0, "employment_status": 1.0,
        "occupation": 8, "industry": 8, "company_size": 2.0, "work_hours": 40.0, "shift_work": 2.0, "night_work": 10.0,
        "physical_risk1": 7.0, "physical_risk2": 5.0, "physical_risk3": 5.0, "physical_risk4": 2.0, "physical_risk5": 6.0,
        "physical_risk6": 6.0, "physical_risk7": 6.0, "physical_risk8": 6.0, "physical_risk9": 6.0,
        "ergonomic_risk1": 5.0, "ergonomic_risk2": 6.0, "ergonomic_risk3": 3.0, "ergonomic_risk4": 6.0, "ergonomic_risk5": 1.0, "ergonomic_risk6": 3.0,
        "psychosocial_risk1": 4.0, "psychosocial_risk2": 6.0, "psychosocial_risk3": 6.0,
        "health_condition": 2.0, "work_related_disease": 2.0, "injury_absence_days": 0.0, "illness_absence_days": 2.0,
        "presenteeism": 2.0, "sleep_quality1": 5.0, "sleep_quality2": 5.0, "sleep_quality3": 5.0, "well_being": 2.0,
        "working_years": 15.0, "safety_training": 2.0, "training_participation": 2.0
    },
    "근로자5": {
        "gender": 2, "age": 34, "age_group": 30, "education": 4.0, "employment_type": 3.0, "employment_status": 2.0,
        "occupation": 7, "industry": 3, "company_size": 4.0, "work_hours": 40.0, "shift_work": 2.0, "night_work": 10.0,
        "physical_risk1": 7.0, "physical_risk2": 5.0, "physical_risk3": 6.0, "physical_risk4": 6.0, "physical_risk5": 3.0,
        "physical_risk6": 7.0, "physical_risk7": 7.0, "physical_risk8": 7.0, "physical_risk9": 7.0,
        "ergonomic_risk1": 3.0, "ergonomic_risk2": 7.0, "ergonomic_risk3": 6.0, "ergonomic_risk4": 6.0, "ergonomic_risk5": 2.0, "ergonomic_risk6": 2.0,
        "psychosocial_risk1": 7.0, "psychosocial_risk2": 7.0, "psychosocial_risk3": 7.0,
        "health_condition": 2.0, "work_related_disease": 2.0, "injury_absence_days": 0.0, "illness_absence_days": 3.0,
        "presenteeism": 1.0, "sleep_quality1": 4.0, "sleep_quality2": 5.0, "sleep_quality3": 3.0, "well_being": 5.0,
        "working_years": 0.0, "safety_training": 2.0, "training_participation": 2.0
    },
    "근로자6": {
        "gender": 1, "age": 54, "age_group": 50, "education": 1.0, "employment_type": 3.0, "employment_status": 1.0,
        "occupation": 9, "industry": 12, "company_size": 2.0, "work_hours": 48.0, "shift_work": 2.0, "night_work": 10.0,
        "physical_risk1": 7.0, "physical_risk2": 7.0, "physical_risk3": 7.0, "physical_risk4": 7.0, "physical_risk5": 7.0,
        "physical_risk6": 7.0, "physical_risk7": 7.0, "physical_risk8": 7.0, "physical_risk9": 7.0,
        "ergonomic_risk1": 7.0, "ergonomic_risk2": 7.0, "ergonomic_risk3": 5.0, "ergonomic_risk4": 6.0, "ergonomic_risk5": 3.0, "ergonomic_risk6": 5.0,
        "psychosocial_risk1": 2.0, "psychosocial_risk2": 4.0, "psychosocial_risk3": 6.0,
        "health_condition": 2.0, "work_related_disease": 2.0, "injury_absence_days": 0.0, "illness_absence_days": 2.0,
        "presenteeism": 1.0, "sleep_quality1": 4.0, "sleep_quality2": 5.0, "sleep_quality3": 5.0, "well_being": 4.0,
        "working_years": 8.0, "safety_training": 2.0, "training_participation": 2.0
    }
}

# 4. Load Existing Workers
workers = []
if os.path.exists(DATA_FILE):
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        try:
            workers = json.load(f)
        except:
            workers = []

print(f"Loaded {len(workers)} existing workers.")

# 5. Inject New Workers
for name, profile in new_data_raw.items():
    # Check if worker with this name already exists to avoid dupes (optional, but good practice)
    # We'll just append them as new entries for now to ensure they are added.
    new_worker = {
        "id": str(uuid.uuid4()),
        "name": name,
        "profile": profile,
        "timestamp": pd.Timestamp.now().isoformat()
    }
    workers.append(new_worker)
    print(f"Added {name}")

# 6. Recalculate Risk for ALL Workers
print("Recalculating risks for all workers...")
updated_workers = []
for w in workers:
    profile = w.get("profile", {})
    if not profile:
        continue
        
    prob, type_label = predict_worker_risk(profile)
    w["risk_prob"] = prob
    w["risk_type"] = type_label
    
    # Simple top risks calculation (mocking the complex one for speed, or we could import it)
    # For now, we just want the risk score to be correct. 
    # If top_risks is missing, we might want to add a placeholder or copy logic.
    # But the user's main concern is the risk score distribution.
    
    updated_workers.append(w)

# 7. Save Back
with open(DATA_FILE, 'w', encoding='utf-8') as f:
    json.dump(updated_workers, f, ensure_ascii=False, indent=2)

# 8. Report Distribution
high = len([w for w in updated_workers if w['risk_prob'] >= 50])
medium = len([w for w in updated_workers if 20 <= w['risk_prob'] < 50])
low = len([w for w in updated_workers if w['risk_prob'] < 20])

print("\n[Recalculation Complete]")
print(f"Total Workers: {len(updated_workers)}")
print(f"High Risk (>=50%): {high}")
print(f"Medium Risk (20-50%): {medium}")
print(f"Low Risk (<20%): {low}")
