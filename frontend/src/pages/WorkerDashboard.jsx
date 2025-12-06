import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ClipboardCheck, ChevronRight, ChevronLeft } from 'lucide-react';
import API_BASE_URL from '../config';

const WorkerDashboard = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('intro');
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        // Basic Info (Read-only from profile)
        name: '',
        gender: 1,
        age_group: 30,
        education: 4,
        industry: 3,

        // Fixed / Hidden
        occupation: 9, // Default excluded
        employment_type: 3, // Fixed as per request
        company_size: 4, // Default excluded

        // Survey Fields
        employment_status: 1,
        work_hours: 40,
        shift_work: 0,
        night_work: 0,
        working_years: 1,
        safety_training: 2,
        training_participation: 2,

        // Risks
        physical_risk1: 1, physical_risk2: 1, physical_risk3: 1,
        physical_risk4: 1, physical_risk5: 1, physical_risk6: 1,
        physical_risk7: 1, physical_risk8: 1, physical_risk9: 1,

        ergonomic_risk1: 1, ergonomic_risk2: 1, ergonomic_risk3: 1,
        ergonomic_risk4: 1, ergonomic_risk5: 1, ergonomic_risk6: 1,

        psychosocial_risk1: 1, psychosocial_risk2: 1, psychosocial_risk3: 1,

        // Health
        health_condition: 2,
        work_related_disease: 2,
        presenteeism: 2,
        sleep_quality1: 4,
        sleep_quality2: 4,
        sleep_quality3: 4,
        well_being: 2
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            alert('로그인이 필요합니다.');
            navigate('/worker/login');
            return;
        }
        const user = JSON.parse(storedUser);
        if (user.basic_info) {
            setFormData(prev => ({
                ...prev,
                name: user.basic_info.name || '',
                gender: user.basic_info.gender || 1,
                age_group: user.basic_info.age_group || 30,
                education: user.basic_info.education || 4,
                industry: user.basic_info.industry || 3
            }));
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: Number(value) }));
    };

    const handleTextChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const nextStep = (next) => {
        window.scrollTo(0, 0);
        setStep(next);
    };

    const handleSubmit = async () => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            alert('로그인이 필요합니다.');
            navigate('/worker/login');
            return;
        }
        const { id: userId } = JSON.parse(storedUser);

        setLoading(true);
        try {
            const { name, ...profile } = formData;
            const res = await axios.post(`${API_BASE_URL}/api/survey`, {
                name: name,
                profile: profile,
                user_id: userId
            });
            navigate(`/worker/result/${res.data.id}`);
        } catch (error) {
            console.error("Survey error:", error);
            alert("분석 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', minHeight: '100vh', backgroundColor: 'white', boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>
                {/* Progress Bar */}
                {step !== 'intro' && (
                    <div style={{ height: '4px', backgroundColor: '#e5e7eb', width: '100%' }}>
                        <div
                            style={{
                                height: '100%',
                                background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                                transition: 'width 0.5s',
                                width: step === 'survey-1' ? '20%' : step === 'survey-2' ? '40%' : step === 'survey-3' ? '60%' : step === 'survey-4' ? '80%' : '100%'
                            }}
                        />
                    </div>
                )}

                <div style={{ padding: '2rem' }}>
                    {step === 'intro' && <IntroScreen onStart={() => nextStep('survey-1')} />}
                    {step === 'survey-1' && <SurveyStep1 formData={formData} onNext={() => nextStep('survey-2')} />}
                    {step === 'survey-2' && <SurveyStep2 formData={formData} handleChange={handleChange} onNext={() => nextStep('survey-3')} onBack={() => nextStep('survey-1')} />}
                    {step === 'survey-3' && <SurveyStep3 formData={formData} handleChange={handleChange} onNext={() => nextStep('survey-4')} onBack={() => nextStep('survey-2')} />}
                    {step === 'survey-4' && <SurveyStep4 formData={formData} handleChange={handleChange} onNext={() => nextStep('survey-5')} onBack={() => nextStep('survey-3')} />}
                    {step === 'survey-5' && <SurveyStep5 formData={formData} handleChange={handleChange} onSubmit={handleSubmit} onBack={() => nextStep('survey-4')} loading={loading} />}
                </div>
            </div>
        </div>
    );
};

// Intro Screen
const IntroScreen = ({ onStart }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center' }}>
        <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', padding: '2rem', borderRadius: '50%', marginBottom: '2rem', boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)' }}>
            <ClipboardCheck size={64} style={{ color: 'white' }} />
        </div>
        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 'bold', color: '#1f2937', margin: '0 0 1rem 0' }}>근로자 안전 자가진단</h1>
        <p style={{ fontSize: '1rem', color: '#6b7280', margin: '0 0 2rem 0', lineHeight: '1.6', maxWidth: '400px' }}>
            나의 근무 환경과 건강 상태를 점검하고,<br />
            AI가 분석한 맞춤형 안전 가이드를 받아보세요.
        </p>
        <button
            onClick={onStart}
            style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                padding: '1rem 3rem',
                borderRadius: '0.75rem',
                fontSize: '1.125rem',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}
        >
            시작하기 <ChevronRight size={20} />
        </button>
    </div>
);

// Step 1: Basic Info (Read Only)
const SurveyStep1 = ({ formData, onNext }) => (
    <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
        <StepHeader step="1" title="기본 정보" badge="개인정보" />
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                * 기본 정보는 회원가입 시 입력한 정보로 자동 설정됩니다. 수정이 필요한 경우 '내 정보 수정' 페이지를 이용해주세요.
            </div>
            <FormField label="이름">
                <input type="text" value={formData.name} disabled style={disabledInputStyle} />
            </FormField>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormField label="성별">
                    <select value={formData.gender} disabled style={disabledInputStyle}>
                        <option value={1}>남성</option>
                        <option value={2}>여성</option>
                    </select>
                </FormField>
                <FormField label="연령대">
                    <select value={formData.age_group} disabled style={disabledInputStyle}>
                        <option value={20}>20대 이하</option>
                        <option value={30}>30대</option>
                        <option value={40}>40대</option>
                        <option value={50}>50대</option>
                        <option value={60}>60대 이상</option>
                    </select>
                </FormField>
            </div>
            <FormField label="학력">
                <select value={formData.education} disabled style={disabledInputStyle}>
                    <option value={1}>무학/초졸 미만</option>
                    <option value={2}>초졸</option>
                    <option value={3}>중졸</option>
                    <option value={4}>고졸</option>
                    <option value={5}>전문대졸</option>
                    <option value={6}>대졸</option>
                    <option value={7}>대학원 이상</option>
                </select>
            </FormField>
            <FormField label="산업 분야">
                <select value={formData.industry} disabled style={disabledInputStyle}>
                    <option value={2}>광업</option>
                    <option value={3}>제조업</option>
                    <option value={4}>전기, 가스, 증기 및 공기 조절 공급</option>
                    <option value={5}>수도, 하수 및 폐기물 처리, 원료 재생</option>
                    <option value={6}>건설업</option>
                    <option value={8}>운수 및 창고업</option>
                </select>
            </FormField>
            <NextButton onClick={onNext} />
        </div>
    </div>
);

// Step 2: Work Environment
const SurveyStep2 = ({ formData, handleChange, onNext, onBack }) => (
    <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
        <StepHeader step="2" title="근무 환경" badge="직무 정보" onBack={onBack} />
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <FormField label="고용 형태">
                <select name="employment_status" value={formData.employment_status} onChange={handleChange} style={inputStyle}>
                    <option value={1}>상용근로자</option>
                    <option value={2}>임시근로자</option>
                    <option value={3}>일용근로자</option>
                </select>
            </FormField>
            <FormField label="주간 근무 시간 (시간)">
                <input type="number" name="work_hours" value={formData.work_hours} onChange={handleChange} style={inputStyle} />
            </FormField>
            <FormField label="교대 근무 형태">
                <select name="shift_work" value={formData.shift_work} onChange={handleChange} style={inputStyle}>
                    <option value={0}>해당 없음</option>
                    <option value={1}>하루 단위 분할 교대</option>
                    <option value={2}>고정 교대</option>
                    <option value={3}>순환 교대</option>
                    <option value={4}>기타</option>
                </select>
            </FormField>
            <FormField label="월간 야간 근무 횟수 (회)">
                <input type="number" name="night_work" value={formData.night_work} onChange={handleChange} style={inputStyle} />
            </FormField>
            <FormField label="근속 연수 (년)">
                <input type="number" name="working_years" value={formData.working_years} onChange={handleChange} style={inputStyle} />
            </FormField>
            <FormField label="안전 교육 제공 수준">
                <select name="safety_training" value={formData.safety_training} onChange={handleChange} style={inputStyle}>
                    <option value={1}>매우 잘 제공받음</option>
                    <option value={2}>잘 제공받는 편</option>
                    <option value={3}>별로 제공받지 못함</option>
                    <option value={4}>전혀 제공받지 못함</option>
                </select>
            </FormField>
            <FormField label="안전 교육 참여 경험">
                <select name="training_participation" value={formData.training_participation} onChange={handleChange} style={inputStyle}>
                    <option value={1}>있다</option>
                    <option value={2}>없다</option>
                </select>
            </FormField>
            <NextButton onClick={onNext} />
        </div>
    </div>
);

// Step 3: Physical Risks
const SurveyStep3 = ({ formData, handleChange, onNext, onBack }) => (
    <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
        <StepHeader step="3" title="물리적 위험" badge="작업 환경" onBack={onBack} />
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <RiskSection title="물리적 위험 요인 노출 빈도" description="1(전혀 없음) ~ 7(매우 자주)">
                <RangeInput label="진동 (수공구, 기계 등)" name="physical_risk1" value={formData.physical_risk1} onChange={handleChange} />
                <RangeInput label="심한 소음" name="physical_risk2" value={formData.physical_risk2} onChange={handleChange} />
                <RangeInput label="고온 환경" name="physical_risk3" value={formData.physical_risk3} onChange={handleChange} />
                <RangeInput label="저온 환경" name="physical_risk4" value={formData.physical_risk4} onChange={handleChange} />
                <RangeInput label="분진/가스 흡입" name="physical_risk5" value={formData.physical_risk5} onChange={handleChange} />
                <RangeInput label="유기 용제 증기" name="physical_risk6" value={formData.physical_risk6} onChange={handleChange} />
                <RangeInput label="화학 물질 접촉" name="physical_risk7" value={formData.physical_risk7} onChange={handleChange} />
                <RangeInput label="간접 흡연" name="physical_risk8" value={formData.physical_risk8} onChange={handleChange} />
                <RangeInput label="감염성 물질 접촉" name="physical_risk9" value={formData.physical_risk9} onChange={handleChange} />
            </RiskSection>
            <NextButton onClick={onNext} />
        </div>
    </div>
);

// Step 4: Ergonomic & Psychosocial Risks
const SurveyStep4 = ({ formData, handleChange, onNext, onBack }) => (
    <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
        <StepHeader step="4" title="신체/심리적 부담" badge="작업 부하" onBack={onBack} />
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <RiskSection title="신체적 부담 작업 빈도" description="1(전혀 없음) ~ 7(매우 자주)">
                <RangeInput label="통증 유발 자세" name="ergonomic_risk1" value={formData.ergonomic_risk1} onChange={handleChange} />
                <RangeInput label="사람 운반/이동" name="ergonomic_risk2" value={formData.ergonomic_risk2} onChange={handleChange} />
                <RangeInput label="중량물 취급" name="ergonomic_risk3" value={formData.ergonomic_risk3} onChange={handleChange} />
                <RangeInput label="장시간 서기" name="ergonomic_risk4" value={formData.ergonomic_risk4} onChange={handleChange} />
                <RangeInput label="장시간 앉기" name="ergonomic_risk5" value={formData.ergonomic_risk5} onChange={handleChange} />
                <RangeInput label="반복적 동작" name="ergonomic_risk6" value={formData.ergonomic_risk6} onChange={handleChange} />
            </RiskSection>
            <RiskSection title="감정 노동 및 심리적 부담" description="1(전혀 없음) ~ 7(매우 자주)">
                <RangeInput label="고객/민원인 응대" name="psychosocial_risk1" value={formData.psychosocial_risk1} onChange={handleChange} />
                <RangeInput label="화난 고객 응대" name="psychosocial_risk2" value={formData.psychosocial_risk2} onChange={handleChange} />
                <RangeInput label="감정적 불안 상황" name="psychosocial_risk3" value={formData.psychosocial_risk3} onChange={handleChange} />
            </RiskSection>
            <NextButton onClick={onNext} />
        </div>
    </div>
);

// Step 5: Health & Well-being
const SurveyStep5 = ({ formData, handleChange, onSubmit, onBack, loading }) => (
    <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
        <StepHeader step="5" title="건강 상태" badge="건강 정보" onBack={onBack} />
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <FormField label="전반적인 건강 상태">
                <select name="health_condition" value={formData.health_condition} onChange={handleChange} style={inputStyle}>
                    <option value={1}>매우 좋다</option>
                    <option value={2}>좋은 편이다</option>
                    <option value={3}>보통이다</option>
                    <option value={4}>나쁜 편이다</option>
                    <option value={5}>매우 나쁘다</option>
                </select>
            </FormField>
            <FormField label="업무 관련 질병 경험 (6개월 이상)">
                <select name="work_related_disease" value={formData.work_related_disease} onChange={handleChange} style={inputStyle}>
                    <option value={1}>있다</option>
                    <option value={2}>없다</option>
                </select>
            </FormField>
            <FormField label="아플 때 근무한 경험 (프리젠티즘)">
                <select name="presenteeism" value={formData.presenteeism} onChange={handleChange} style={inputStyle}>
                    <option value={1}>있다</option>
                    <option value={2}>없다</option>
                    <option value={7}>아프지 않았다</option>
                </select>
            </FormField>
            <RiskSection title="수면의 질" description="1(매일) ~ 5(전혀 없음)">
                <RangeInput label="잠들기 어려움" name="sleep_quality1" value={formData.sleep_quality1} onChange={handleChange} max={5} />
                <RangeInput label="자주 깸" name="sleep_quality2" value={formData.sleep_quality2} onChange={handleChange} max={5} />
                <RangeInput label="자고 나도 피곤함" name="sleep_quality3" value={formData.sleep_quality3} onChange={handleChange} max={5} />
            </RiskSection>
            <FormField label="지난 2주간 상쾌하고 푹 쉰 느낌">
                <select name="well_being" value={formData.well_being} onChange={handleChange} style={inputStyle}>
                    <option value={1}>항상 그랬다</option>
                    <option value={2}>대부분 그랬다</option>
                    <option value={3}>절반 이상 그랬다</option>
                    <option value={4}>절반 미만 그랬다</option>
                    <option value={5}>가끔 그랬다</option>
                    <option value={6}>그런 적 없다</option>
                </select>
            </FormField>

            <button
                onClick={onSubmit}
                disabled={loading}
                style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    color: 'white',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    border: 'none',
                    borderRadius: '0.75rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 6px rgba(99, 102, 241, 0.3)',
                    marginTop: '2rem',
                    transition: 'all 0.3s'
                }}
            >
                {loading ? '분석 중...' : '진단 완료 및 결과 보기'}
            </button>
        </div>
    </div>
);

// --- Reusable Components ---

const StepHeader = ({ step, title, badge, onBack }) => (
    <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            {onBack ? (
                <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' }}>
                    <ChevronLeft size={20} /> 이전
                </button>
            ) : <div />}
            <span style={{ backgroundColor: '#eff6ff', color: '#3b82f6', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '600' }}>
                {badge}
            </span>
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
            {title} <span style={{ color: '#9ca3af', fontSize: '1rem', fontWeight: 'normal' }}>({step}/5)</span>
        </h2>
    </div>
);

const FormField = ({ label, children }) => (
    <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            {label}
        </label>
        {children}
    </div>
);

const RiskSection = ({ title, description, children }) => (
    <div style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.25rem' }}>{title}</h3>
        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '1.5rem' }}>{description}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {children}
        </div>
    </div>
);

const RangeInput = ({ label, name, value, onChange, min = 1, max = 7 }) => (
    <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#4b5563' }}>{label}</label>
            <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#6366f1' }}>{value}</span>
        </div>
        <input
            type="range"
            name={name}
            min={min}
            max={max}
            value={value}
            onChange={onChange}
            style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
            <span>{min === 1 && max === 5 ? '매일' : '매우 자주'}</span>
            <span>{min === 1 && max === 5 ? '전혀 없음' : '전혀 없음'}</span>
        </div>
    </div>
);

const NextButton = ({ onClick }) => (
    <button
        onClick={onClick}
        style={{
            width: '100%',
            padding: '1rem',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            fontSize: '1.125rem',
            fontWeight: '600',
            border: 'none',
            borderRadius: '0.75rem',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(99, 102, 241, 0.3)',
            marginTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s'
        }}
    >
        다음 <ChevronRight size={20} />
    </button>
);

const inputStyle = {
    width: '100%',
    padding: '0.875rem',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    outline: 'none',
    backgroundColor: '#ffffff',
    transition: 'all 0.2s'
};

const disabledInputStyle = {
    ...inputStyle,
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    cursor: 'not-allowed'
};

export default WorkerDashboard;
