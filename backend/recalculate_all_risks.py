import json
import pandas as pd
import joblib
import numpy as np
import os
from datetime import datetime

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "data", "workers.json")
MODEL_BINARY = os.path.join(BASE_DIR, "models", "accident_binary_model_final_recall.pkl")
MODEL_TYPE = os.path.join(BASE_DIR, "models", "accident_type_model_final_recall.pkl")

# Load models
print("Loading models...")
binary_model = joblib.load(MODEL_BINARY)
type_model = joblib.load(MODEL_TYPE)
BINARY_FEATURES = list(getattr(binary_model, "feature_names_in_", []))

# Feature labels for top risks
FEATURE_LABELS = {
    "work_hours": "주당 근무시간",
    "shift_work": "교대근무 형태",
    "night_work": "야간작업 횟수",
    "physical_risk1": "진동 노출 (수공구·기계 등)",
    "physical_risk2": "심한 소음 노출",
    "physical_risk3": "고온 환경 노출",
    "physical_risk4": "저온 환경 노출",
    "physical_risk5": "연기·흄·먼지 흡입 노출",
    "physical_risk6": "유기용제(솔벤트 등) 노출",
    "physical_risk7": "화학물질 접촉",
    "physical_risk8": "간접흡연 노출",
    "physical_risk9": "감염성 물질 접촉",
    "ergonomic_risk1": "피로하거나 통증 유발 자세",
    "ergonomic_risk2": "사람을 들어올리거나 이동",
    "ergonomic_risk3": "무거운 물건 밀기·끌기·운반",
    "ergonomic_risk4": "오랜 시간 서 있는 자세",
    "ergonomic_risk5": "오랜 시간 앉아 있는 자세",
    "ergonomic_risk6": "반복적인 손·팔 동작",
    "psychosocial_risk1": "고객·민원인 응대 빈도",
    "psychosocial_risk2": "화난 고객·환자 응대 빈도",
    "psychosocial_risk3": "정서적 불안 상황 경험 빈도",
    "presenteeism": "아플 때 근무 경험",
    "safety_training": "건강·안전정보 제공 정도"
}
ACTIONABLE = set(FEATURE_LABELS.keys())

# Domain for perturbation
DOMAIN = {
    "work_hours": (0, 84),
    "shift_work": (0, 4),
    "night_work": (0, 7),
    "safety_training": (1, 4),
    "training_participation": (1, 2),
    "presenteeism": (1, 2),
    "employment_status": (1, 3),
    "working_years": (0, 40),
    "health_condition": (1, 5),
    "work_related_disease": (1, 2),
    "well_being": (1, 6),
    **{f"physical_risk{i}": (1, 7) for i in range(1, 10)},
    **{f"ergonomic_risk{i}": (1, 7) for i in range(1, 7)},
    **{f"psychosocial_risk{i}": (1, 7) for i in range(1, 4)},
    "sleep_quality1": (1, 5),
    "sleep_quality2": (1, 5),
    "sleep_quality3": (1, 5),
}

def _rand_in_domain(col, base_val):
    lo, hi = DOMAIN.get(col, (None, None))
    if lo is None:
        if isinstance(base_val, (int, float)):
            span = max(1, int(abs(base_val) * 0.1))
            lo = int(max(0, base_val - span))
            hi = int(base_val + span)
        else:
            return base_val
    if isinstance(base_val, float):
        return float(np.random.randint(lo, hi))
    return int(np.random.randint(lo, hi))

def get_top_features_local(model, profile_dict, top_k=3, n_samples=64):
    np.random.seed(42)
    x0 = pd.DataFrame([profile_dict], columns=BINARY_FEATURES).fillna(0)
    base_prob = float(model.predict_proba(x0)[0, 1])
    impacts = {}
    for col in BINARY_FEATURES:
        if col not in ACTIONABLE:
            continue
        rows = []
        for _ in range(n_samples):
            row = dict(profile_dict)
            row[col] = _rand_in_domain(col, profile_dict.get(col, 0))
            rows.append(row)
        X = pd.DataFrame(rows, columns=BINARY_FEATURES).fillna(0)
        probs = model.predict_proba(X)[:, 1]
        impacts[col] = float(np.mean(np.abs(probs - base_prob)))
    
    if not impacts:
        return []
    
    s = pd.Series(impacts).sort_values(ascending=False)
    s = s[s > 0]
    if s.empty:
        return []
    
    top = s.head(top_k)
    weights = (top / top.sum() * 100.0).round(1)
    
    out = []
    for f, w in weights.items():
        label = FEATURE_LABELS.get(f, f)
        out.append({"feature": f, "label": label, "weight": float(w)})
    return out

def predict_worker_risk(profile):
    df = pd.DataFrame([profile], columns=BINARY_FEATURES).fillna(0)
    prob = float(binary_model.predict_proba(df)[0, 1] * 100.0)
    if prob >= 20.0:
        typ = int(type_model.predict(df)[0])
        type_label = "업무상 질병" if typ == 1 else "업무상 사고"
    else:
        type_label = "예측 없음"
    return prob, type_label

# Load existing workers
if os.path.exists(DATA_FILE):
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        workers = json.load(f)
else:
    print("No workers file found!")
    exit(1)

print(f"Loaded {len(workers)} workers. Recalculating all risks...")

updated_count = 0
for worker in workers:
    profile = worker.get("profile", {})
    
    # 1. Apply Mapping (Ensure it's present)
    if "physical_risk8" in profile:
        profile["physical_risk"] = profile["physical_risk8"]
    if "physical_risk9" in profile:
        profile["physical_risk.1"] = profile["physical_risk9"]
        
    # 2. Predict Risk
    prob, type_label = predict_worker_risk(profile)
    
    # 3. Get Top Risks
    top_risks = get_top_features_local(binary_model, profile)
    
    # 4. Update Record
    worker["risk_prob"] = prob
    worker["risk_type"] = type_label
    worker["top_risks"] = top_risks
    
    updated_count += 1
    # print(f"Updated {worker.get('name')}: {prob:.1f}%")

# Save updated workers
with open(DATA_FILE, 'w', encoding='utf-8') as f:
    json.dump(workers, f, ensure_ascii=False, indent=2)

print(f"Successfully recalculated and saved {updated_count} workers to {DATA_FILE}")
