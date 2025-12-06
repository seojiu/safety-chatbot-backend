from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib, numpy as np, pandas as pd, random, re, os, json, uuid
from openai import OpenAI
from dotenv import load_dotenv
from utils.profiles import BASE_PROFILES
from utils.feature import FEATURE_LABELS, NON_ACTIONABLE

# .env 파일 로드
load_dotenv()

# OpenAI Client 설정
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
LLM_MODEL = "gpt-4o-mini"

app = Flask(__name__)
CORS(app)

# 1) 모델 로드
binary_model = joblib.load("models/accident_binary_model_final_recall.pkl")
type_model   = joblib.load("models/accident_type_model_final_recall.pkl")
BINARY_FEATURES = list(getattr(binary_model, "feature_names_in_", []))

# 3) ACTIONABLE / NON-ACTIONABLE 구분
ACTIONABLE = set(FEATURE_LABELS.keys()) - NON_ACTIONABLE

# 데이터 파일 경로
DATA_FILE = "data/workers.json"
USERS_FILE = "data/users.json"
SETTINGS_FILE = "data/settings.json"

def load_settings():
    if not os.path.exists(SETTINGS_FILE):
        return {"industry": 3, "company_size": 4} # Defaults
    with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except:
            return {"industry": 3, "company_size": 4}

def save_settings(settings):
    with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(settings, f, ensure_ascii=False, indent=2)

def load_workers():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except:
            return []

def save_workers(workers):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(workers, f, ensure_ascii=False, indent=2)

def load_users():
    if not os.path.exists(USERS_FILE):
        return []
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except:
            return []

def save_users(users):
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, ensure_ascii=False, indent=2)

# ... (rest of the file)

@app.route("/api/admin/settings", methods=["GET", "POST"])
def manage_settings():
    if request.method == "GET":
        return jsonify(load_settings())
    
    # POST: Update global settings and propagate to ALL users and workers
    new_settings = request.json
    save_settings(new_settings)
    
    # 1. Update all Users
    users = load_users()
    for user in users:
        if "basic_info" not in user: user["basic_info"] = {}
        user["basic_info"].update(new_settings)
    save_users(users)
    
    # 2. Update all Workers (Survey Records) and Re-predict
    workers = load_workers()
    updated_count = 0
    for worker in workers:
        if "profile" not in worker:
            continue
        
        # Re-predict Risk based on existing profile (unchanged)
        prob, type_label = predict_worker_risk(worker["profile"])
        worker["risk_prob"] = prob
        worker["risk_type"] = type_label
        
        # Re-calculate Top Risks (optional but okay)
        top_feats = get_top_features_local(binary_model, worker["profile"], top_k=3, n_samples=64)
        worker["top_risks"] = [{"feature": f, "label": l, "weight": w} for f, l, w in top_feats]
        
        updated_count += 1

    save_workers(workers)
    
    return jsonify({"message": f"Settings updated. {len(users)} users and {updated_count} records updated.", "settings": new_settings})


# 6) AI Safety Report Generation
def generate_safety_report(summary_data):
    prompt = f"""
    You are an Industrial Safety Expert AI. Analyze the following safety data for a workplace and provide a structured report.
    
    [Workplace Data]
    - Total Workers: {summary_data['total_workers']}
    - Average Risk Score: {summary_data['avg_risk']:.1f}%
    - Risk Distribution: High({summary_data['high_risk']}), Medium({summary_data['medium_risk']}), Low({summary_data['low_risk']})
    - Top Risk Factors (Frequency): {summary_data['top_risks']}
    
    [Instructions]
    Provide the report in the following JSON format (Korean):
    {{
        "briefing": "One paragraph summary of the overall safety status.",
        "trends": "Analysis of the top risk factors and what they imply.",
        "suggestions": "3 concrete, actionable suggestions to improve safety based on the data."
    }}
    Keep the tone professional and encouraging.
    """
    
    try:
        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[
                {"role": "system", "content": "You are a helpful industrial safety assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        content = response.choices[0].message.content
        # Extract JSON if wrapped in code blocks
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]
            
        return json.loads(content)
    except Exception as e:
        print(f"Error generating report: {e}")
        return {
            "briefing": "리포트 생성 중 오류가 발생했습니다.",
            "trends": "데이터를 분석할 수 없습니다.",
            "suggestions": "잠시 후 다시 시도해주세요."
        }

@app.route("/api/admin/report", methods=["POST"])
def get_safety_report():
    workers = load_workers()
    
    if not workers:
        return jsonify({
            "briefing": "등록된 근로자 데이터가 없습니다.",
            "trends": "-",
            "suggestions": "-"
        })
        
    # Aggregate Data
    total_workers = len(workers)
    risk_probs = [w.get("risk_prob", 0) for w in workers]
    avg_risk = sum(risk_probs) / total_workers if total_workers > 0 else 0
    
    high_risk = len([p for p in risk_probs if p >= 50])
    medium_risk = len([p for p in risk_probs if 20 <= p < 50])
    low_risk = len([p for p in risk_probs if p < 20])
    
    # Count Top Risks
    risk_counts = {}
    for w in workers:
        for risk in w.get("top_risks", []):
            label = risk.get("label", "Unknown")
            risk_counts[label] = risk_counts.get(label, 0) + 1
            
    # Get Top 5 Risks
    sorted_risks = sorted(risk_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    top_risks_str = ", ".join([f"{k}({v}명)" for k, v in sorted_risks])
    
    summary_data = {
        "total_workers": total_workers,
        "avg_risk": avg_risk,
        "high_risk": high_risk,
        "medium_risk": medium_risk,
        "low_risk": low_risk,
        "top_risks": top_risks_str
    }
    
    report = generate_safety_report(summary_data)
    return jsonify(report)


# 5) Smalltalk 인식
def detect_smalltalk(text: str) -> bool:
    low = text.lower()
    greetings = ["안녕", "안녕하세요", "하이", "hello", "반가워", "누구", "정체", "뭐해", "챗봇"]
    return any(g in low for g in greetings)

# 개선 질문 감지
def detect_solution_request(text: str) -> bool:
    keywords = [
        r"낮추", r"낮출", r"줄이", r"줄일", r"감소", r"감소시", r"개선", r"완화",
        r"줄어들", r"줄이려", r"낮아지", r"낮아질", r"낮게", r"줄이기", r"예방"
    ]
    return any(re.search(kw, text) for kw in keywords)

# 7) 예측 (고위험군 + 유형)
LOW_RISK_THRESHOLD = 20.0

def predict_worker_risk(profile: dict):
    # 모델 입력에 필요한 컬럼만 추출 및 0으로 채움
    df = pd.DataFrame([profile], columns=BINARY_FEATURES).fillna(0)
    prob = float(binary_model.predict_proba(df)[0, 1] * 100.0)
    if prob >= LOW_RISK_THRESHOLD:
        typ = int(type_model.predict(df)[0])
        type_label = "업무상 질병" if typ == 1 else "업무상 사고"
    else:
        type_label = "예측 없음"
    return prob, type_label

# 8) 로컬 퍼터베이션 기반 상위 위험요인
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
        return float(random.randint(lo, hi))
    return int(random.randint(lo, hi))

def get_top_features_local(model, profile_dict, top_k=3, n_samples=64):
    random.seed(42)
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
        out.append((f, label, float(w)))
    return out

# LLM 기반 솔루션 생성 함수
def generate_solution_text(label, weight, type_label):
    prompt = (
        f"'{label}'이(가) 주요 위험요인으로 확인되었습니다. "
        f"이 요인을 완화하거나 예방하기 위한 현장 중심의 실질적 개선 조치를 "
        f"하나의 문장으로 간결하게 제안해주세요. "
        f"너무 길게 설명하지 말고, 핵심만 짧게 제시하세요. "
        f"예: '작업 사이 휴식시간 확보 및 인체공학적 도구 도입이 필요합니다.' 같은 형식으로."
    )

    try:
        res = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[
                {"role": "system", "content": "당신은 산업안전 전문가이며, 실질적이고 간결한 조언을 제공합니다."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
        )
        return res.choices[0].message.content.strip()
    except Exception as e:
        print(f"[LLM ERROR] {e}")
        return "(교육 강화 및 휴식 보장 권장)"

# 개선 시뮬레이션
def simulate_improvement(profile, top_feats, type_label):
    improved = dict(profile)
    changes = []
    for feat, label, w in top_feats:
        if feat not in DOMAIN:
            continue
        lo, hi = DOMAIN[feat]
        cur = profile.get(feat, 0)
        new_val = lo if cur > lo else cur
        if new_val != cur:
            improved[feat] = new_val
        # LLM 솔루션 생성
        tip = generate_solution_text(label, w, type_label)
        changes.append((label, w, tip))
    
    # 개선 후 위험도 예측
    new_prob, _ = predict_worker_risk(improved)
    
    # 현재 위험도 계산
    current_prob, _ = predict_worker_risk(profile)
    
    # 개선 후 위험도가 오히려 높아지거나 변화가 없으면 최소 0.5% 감소 보장
    if new_prob >= current_prob:
        new_prob = max(0, current_prob - 0.5)
    
    return new_prob, changes

# --- API Endpoints ---

# User Management APIs
@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    basic_info = data.get("basic_info", {})
    
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
    
    users = load_users()
    
    # Check if username already exists
    if any(u["username"] == username for u in users):
        return jsonify({"error": "Username already exists"}), 400
    
    # Apply Global Settings
    global_settings = load_settings()
    basic_info.update(global_settings)

    user_id = str(uuid.uuid4())
    user_data = {
        "id": user_id,
        "username": username,
        "password": password,  # In production, use hashing!
        "basic_info": basic_info,
        "created_at": pd.Timestamp.now().isoformat(),
        "last_survey_date": None
    }
    
    users.append(user_data)
    save_users(users)
    
    return jsonify({
        "id": user_id,
        "username": username,
        "basic_info": basic_info,
        "last_survey_date": None
    })

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
    
    users = load_users()
    user = next((u for u in users if u["username"] == username and u["password"] == password), None)
    
    if not user:
        return jsonify({"error": "Invalid username or password"}), 401
    
    return jsonify({
        "id": user["id"],
        "username": user["username"],
        "basic_info": user.get("basic_info", {}),
        "last_survey_date": user.get("last_survey_date")
    })

@app.route("/api/users/<user_id>", methods=["GET", "PUT"])
def manage_user(user_id):
    users = load_users()
    user_idx = next((i for i, u in enumerate(users) if u["id"] == user_id), -1)

    if user_idx == -1:
        return jsonify({"error": "User not found"}), 404

    if request.method == "PUT":
        data = request.json
        if "basic_info" in data:
            users[user_idx]["basic_info"] = data["basic_info"]
        save_users(users)

    user = users[user_idx]
    return jsonify({
        "id": user["id"],
        "username": user["username"],
        "basic_info": user.get("basic_info", {}),
        "last_survey_date": user.get("last_survey_date")
    })

@app.route("/api/survey-results/<result_id>", methods=["GET"])
def get_survey_result(result_id):
    workers = load_workers()
    result = next((w for w in workers if w["id"] == result_id), None)
    if result:
        return jsonify(result)
    return jsonify({"error": "Result not found"}), 404

@app.route("/api/users/<user_id>/surveys", methods=["GET"])
def get_user_surveys(user_id):
    workers = load_workers()
    user_surveys = [w for w in workers if w.get("user_id") == user_id]
    user_surveys.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    return jsonify(user_surveys)

@app.route("/api/workers", methods=["GET"])
def get_workers():
    workers = load_workers()
    return jsonify(workers)

@app.route("/api/workers/<worker_id>", methods=["GET", "PUT"])
def manage_worker_record(worker_id):
    workers = load_workers()
    worker_idx = next((i for i, w in enumerate(workers) if w["id"] == worker_id), -1)

    if worker_idx == -1:
        return jsonify({"error": "Worker not found"}), 404

    if request.method == "PUT":
        data = request.json
        # Update profile fields if provided
        if "profile" in data:
            workers[worker_idx]["profile"].update(data["profile"])
        save_workers(workers)
        return jsonify(workers[worker_idx])

    return jsonify(workers[worker_idx])

@app.route("/api/survey", methods=["POST"])
def submit_survey():
    data = request.json
    profile = data.get("profile", {})
    name = data.get("name", "Unknown")
    user_id = data.get("user_id")  # Get user_id from request
    
    # 모델 피처 매핑: physical_risk8 → physical_risk, physical_risk9 → physical_risk.1
    if "physical_risk8" in profile:
        profile["physical_risk"] = profile["physical_risk8"]
    if "physical_risk9" in profile:
        profile["physical_risk.1"] = profile["physical_risk9"]
    
    # 위험도 예측
    prob, type_label = predict_worker_risk(profile)
    
    # 주요 위험요인 분석
    top_feats = get_top_features_local(binary_model, profile, top_k=3, n_samples=64)
    top_risks = [{"feature": f, "label": l, "weight": w} for f, l, w in top_feats]
    
    timestamp = pd.Timestamp.now().isoformat()
    
    workers = load_workers()
    
    # Check if this user already has a worker record
    existing_worker = None
    existing_index = -1
    if user_id:
        for idx, worker in enumerate(workers):
            if worker.get("user_id") == user_id:
                existing_worker = worker
                existing_index = idx
                break
    
    if existing_worker:
        # Update existing worker record
        worker_id = existing_worker["id"]  # Keep the same ID
        worker_data = {
            "id": worker_id,
            "user_id": user_id,
            "name": name,
            "profile": profile,
            "risk_prob": prob,
            "risk_type": type_label,
            "top_risks": top_risks,
            "timestamp": timestamp
        }
        workers[existing_index] = worker_data
    else:
        # Create new worker record
        worker_id = str(uuid.uuid4())
        worker_data = {
            "id": worker_id,
            "user_id": user_id,
            "name": name,
            "profile": profile,
            "risk_prob": prob,
            "risk_type": type_label,
            "top_risks": top_risks,
            "timestamp": timestamp
        }
        workers.append(worker_data)
    
    save_workers(workers)
    
    # Update user's last_survey_date if user_id is provided
    if user_id:
        users = load_users()
        for user in users:
            if user["id"] == user_id:
                user["last_survey_date"] = timestamp
                break
        save_users(users)
    
    return jsonify(worker_data)


@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    msg = data.get("message", "").strip()
    worker_id = data.get("worker_id")
    
    # 컨텍스트 로드
    worker_context = ""
    profile = {}
    if worker_id:
        workers = load_workers()
        worker = next((w for w in workers if w["id"] == worker_id), None)
        if worker:
            profile = worker.get("profile", {})
            worker_context = (
                f"사용자 정보: 이름 {worker.get('name')}, "
                f"위험도 {worker.get('risk_prob', 0):.1f}%, "
                f"유형 {worker.get('risk_type')}."
            )

    # 인사 감지
    if detect_smalltalk(msg):
        return jsonify({
            "response": "안녕하세요! 산업안전 AI 어시스턴트입니다. 무엇을 도와드릴까요?"
        })

    # 개선 요청 시
    if detect_solution_request(msg) and profile:
        prob, type_label = predict_worker_risk(profile)
        
        # 저위험군(10% 미만)인 경우 칭찬 메시지 반환
        if prob < 10.0:
             return jsonify({
                "response": f"현재 위험도가 {prob:.1f}%로 매우 안전한 상태입니다! 🎉\n"
                            "지금처럼 안전 수칙을 잘 준수하고 건강 관리에 힘써주세요.\n"
                            "특별한 개선 조치가 필요하지 않습니다."
             })
             
        top_feats = get_top_features_local(binary_model, profile, top_k=3, n_samples=64)
        
        new_prob, changes = simulate_improvement(profile, top_feats, type_label)
        diff = prob - new_prob
        
        if changes:
            change_lines = "\n".join([
                f" - {label} 위험도 완화 ({w}%)\n   💡 {tip}"
                for (label, w, tip) in changes
            ])
        else:
            change_lines = "(변경된 항목 없음)"
            
        response = (
            f"주요 위험요인을 완화했을 때, 고위험군 가능성은 약 {prob:.1f}% → {new_prob:.1f}%로 감소합니다.\n\n"
            f"개선 시뮬레이션:\n{change_lines}"
        )
        return jsonify({"response": response})

    # 일반 질문 (LLM)
    try:
        system_prompt = "당신은 산업안전 전문가입니다. 근로자의 안전을 위해 친절하고 전문적인 조언을 해주세요."
        if worker_context:
            system_prompt += f" {worker_context}"
            
        res = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": msg}
            ],
            temperature=0.7,
        )
        response = res.choices[0].message.content.strip()
        return jsonify({"response": response})
    except Exception as e:
        print(f"[LLM ERROR] {e}")
        return jsonify({"response": "죄송합니다. 일시적인 오류가 발생했습니다."})

@app.route("/debug/worker/<worker_id>", methods=["GET"])
def debug_worker(worker_id):
    workers = load_workers()
    worker = next((w for w in workers if w["id"] == worker_id), None)
    
    if not worker:
        return jsonify({"error": "Worker not found"}), 404
    
    # 현재 저장된 worker JSON
    profile = worker.get("profile", {})

    # 모델 입력 변환 후 값 확인
    df = pd.DataFrame([profile], columns=BINARY_FEATURES).fillna(0)
    
    debug_data = {
        "raw_profile": profile,
        "model_input_for_binary": df.to_dict(orient="records")[0],
        "binary_prediction_prob": float(binary_model.predict_proba(df)[0,1] * 100.0)
    }

    return jsonify(debug_data)


if __name__ == "__main__":
    random.seed(42)
    np.random.seed(42)
    port = int(os.getenv("PORT", 5000))
    app.run(debug=True, host="0.0.0.0", port=port)
