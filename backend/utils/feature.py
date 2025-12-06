FEATURE_LABELS = {
    # 근무 관련
    "night_work": "야간근무 일수",
    "shift_work": "교대근무 형태",
    "work_hours": "주당 근무시간",
    "working_years": "근속년수",
    "employment_type": "종사상 지위",
    "employment_status": "고용형태",
    "company_size": "종사자 수 규모",
    "industry": "산업 대분류",
    "occupation": "직업 대분류",

    # 교육 및 안전 관련
    "safety_training": "건강·안전정보 제공 정도",
    "training_participation": "안전교육·훈련 참여 여부",

    # 물리적 위험 노출
    "physical_risk1": "진동 노출 (수공구·기계 등)",
    "physical_risk2": "심한 소음 노출",
    "physical_risk3": "고온 환경 노출",
    "physical_risk4": "저온 환경 노출",
    "physical_risk5": "연기·흄·먼지 흡입 노출",
    "physical_risk6": "유기용제 증기 흡입 노출",
    "physical_risk7": "화학물질 접촉",
    "physical_risk8": "담배 연기 노출",
    "physical_risk9": "감염물질 접촉",

    # 인체공학적(자세·신체) 위험
    "ergonomic_risk1": "피로하거나 통증 유발 자세",
    "ergonomic_risk2": "사람을 들어올리거나 옮김",
    "ergonomic_risk3": "무거운 물건 밀기·끌기·운반",
    "ergonomic_risk4": "오랜 시간 서 있는 자세",
    "ergonomic_risk5": "오랜 시간 앉아 있는 자세",
    "ergonomic_risk6": "반복적인 손·팔 동작",

    # 심리·사회적 위험
    "psychosocial_risk1": "대민업무 빈도(고객·환자 등 직접 상대)",
    "psychosocial_risk2": "화난 고객·환자 응대 빈도",
    "psychosocial_risk3": "정서적 불안 상황 경험 빈도",

    # 건강·복지 관련
    "health_condition": "건강 상태",
    "work_related_disease": "업무 관련 질병 여부",
    "presenteeism": "아플 때 근무 경험",
    "sleep_quality1": "수면장애 - 잠들기 어려움",
    "sleep_quality2": "수면장애 - 자주 깸",
    "sleep_quality3": "수면장애 - 자고 나도 피곤함",
    "well_being": "최근 2주간 피로 회복감",

    "injury_absence_days": "사고 결근일수",
    "illness_absence_days": "질병 결근일수",
}


NON_ACTIONABLE = {
    "gender","age","age_group","education","employment_type","employment_status",
    "occupation","industry","company_size","working_years","health_condition",
    "work_related_disease","well_being","injury_absence_days","illness_absence_days"
}