import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, User, Activity, AlertTriangle, CheckCircle, TrendingUp, Briefcase, Clock, Heart, MessageCircle } from 'lucide-react';
import API_BASE_URL from '../config';

const WorkerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [worker, setWorker] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorker = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/workers/${id}`);
                setWorker(res.data);
            } catch (error) {
                console.error("Error fetching worker:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWorker();
    }, [id]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>데이터를 불러오는 중...</p>
            </div>
        );
    }

    if (!worker) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>근로자 정보를 찾을 수 없습니다.</p>
            </div>
        );
    }

    const getGender = (v) => v === 1 ? '남성' : v === 2 ? '여성' : '-';
    const getAge = (v) => v ? `${v}대` : '-';
    const getIndustry = (v) => {
        const map = {
            2: '광업',
            3: '제조업',
            4: '전기/가스',
            5: '수도/폐기물',
            6: '건설업',
            8: '운수/창고'
        };
        return map[v] || '기타';
    };

    // Calculate averages for health metrics
    const getSleepQualityAvg = (profile) => {
        const avg = ((profile.sleep_quality1 || 0) + (profile.sleep_quality2 || 0) + (profile.sleep_quality3 || 0)) / 3;
        return avg.toFixed(1);
    };

    const getPhysicalRiskAvg = (profile) => {
        const risks = [
            profile.physical_risk1, profile.physical_risk2, profile.physical_risk3,
            profile.physical_risk4, profile.physical_risk5, profile.physical_risk6,
            profile.physical_risk7, profile.physical_risk8, profile.physical_risk9
        ].filter(r => r !== undefined);
        const avg = risks.reduce((sum, r) => sum + r, 0) / risks.length;
        return avg.toFixed(1);
    };

    const getPsychosocialRiskAvg = (profile) => {
        const risks = [
            profile.psychosocial_risk1, profile.psychosocial_risk2,
            profile.psychosocial_risk3, profile.psychosocial_risk4
        ].filter(r => r !== undefined);
        const avg = risks.reduce((sum, r) => sum + r, 0) / risks.length;
        return avg.toFixed(1);
    };

    const getRiskLevel = (prob) => {
        if (prob >= 50) return { label: '고위험', bgColor: '#fef2f2', textColor: '#dc2626', borderColor: '#fecaca' };
        if (prob >= 20) return { label: '중위험', bgColor: '#fffbeb', textColor: '#d97706', borderColor: '#fed7aa' };
        return { label: '저위험', bgColor: '#f0fdf4', textColor: '#16a34a', borderColor: '#bbf7d0' };
    };

    const riskLevel = getRiskLevel(worker.risk_prob);

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Back Button */}
                <button
                    onClick={() => navigate('/manager')}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        marginBottom: '1.5rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem 0',
                        transition: 'color 0.3s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#6366f1'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
                >
                    <ArrowLeft size={18} />
                    목록으로 돌아가기
                </button>

                {/* Header Card */}
                <div style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem', marginBottom: '2rem', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 0.75rem 0' }}>{worker.name}</h1>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                    {getGender(worker.profile.gender)}
                                </span>
                                <span style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                    {getAge(worker.profile.age_group)}
                                </span>
                                <span style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                    {getIndustry(worker.profile.industry)}
                                </span>
                            </div>
                        </div>
                        <div style={{
                            backgroundColor: riskLevel.bgColor,
                            color: riskLevel.textColor,
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.75rem',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            border: `2px solid ${riskLevel.borderColor}`
                        }}>
                            {worker.risk_prob >= 20 ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
                            {riskLevel.label}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Risk Analysis Card */}
                    <div style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem', border: '1px solid #e5e7eb' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <TrendingUp style={{ color: '#6366f1' }} size={24} />
                            위험도 상세 분석
                        </h2>

                        {/* Risk Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
                                <span style={{ fontSize: '0.875rem', color: '#6b7280', display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>예측 위험도</span>
                                <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: riskLevel.textColor }}>
                                    {worker.risk_prob.toFixed(1)}%
                                </span>
                            </div>
                            <div style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
                                <span style={{ fontSize: '0.875rem', color: '#6b7280', display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>예측 재해 유형</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                                    {worker.risk_type}
                                </span>
                            </div>
                        </div>

                        {/* Top Risks - Only show if risk >= 20% */}
                        {worker.risk_prob >= 20 && (
                            <>
                                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', margin: '0 0 1rem 0' }}>주요 위험 요인</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {worker.top_risks.map((risk, idx) => (
                                        <div key={idx} style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', padding: '1rem', borderRadius: '0.75rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.875rem' }}>{risk.label}</span>
                                                <span style={{ fontSize: '0.875rem', color: '#dc2626', fontWeight: 'bold' }}>{risk.weight}% 기여</span>
                                            </div>
                                            <div style={{ width: '100%', backgroundColor: '#f3f4f6', borderRadius: '9999px', height: '0.5rem', overflow: 'hidden' }}>
                                                <div
                                                    style={{
                                                        background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
                                                        height: '0.5rem',
                                                        borderRadius: '9999px',
                                                        width: `${risk.weight}%`,
                                                        transition: 'width 0.5s'
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Work Environment Card */}
                    <div style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem', border: '1px solid #e5e7eb' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Briefcase style={{ color: '#6366f1' }} size={24} />
                            근무 환경 및 건강
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                            <DetailItem icon={<Clock size={18} />} label="주당 근무" value={`${worker.profile.work_hours}시간`} />
                            <DetailItem icon={<Briefcase size={18} />} label="근속년수" value={`${worker.profile.working_years}년`} />
                            <DetailItem icon={<Heart size={18} />} label="수면 품질 (평균)" value={`${getSleepQualityAvg(worker.profile)}/5`} />
                            <DetailItem icon={<Activity size={18} />} label="육체 부담 (평균)" value={`${getPhysicalRiskAvg(worker.profile)}/7`} />
                            <DetailItem icon={<Activity size={18} />} label="정신 스트레스 (평균)" value={`${getPsychosocialRiskAvg(worker.profile)}/7`} />
                            <DetailItem icon={<User size={18} />} label="산업분야" value={getIndustry(worker.profile.industry)} />
                        </div>
                    </div>

                    {/* AI Consultation Button Card */}
                    <div style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2.5rem', border: '1px solid #e5e7eb' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <MessageCircle style={{ color: '#6366f1', margin: '0 auto' }} size={48} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 0.5rem 0' }}>AI 안전 상담</h3>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 1.5rem 0' }}>
                                진단 결과를 바탕으로 AI가 맞춤형 안전 조언을 제공합니다
                            </p>
                            <button
                                onClick={() => navigate(`/manager/worker/${worker.id}/chat`)}
                                style={{
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                    color: 'white',
                                    padding: '1rem 2rem',
                                    borderRadius: '0.75rem',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    border: 'none',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 6px rgba(99, 102, 241, 0.3)',
                                    transition: 'all 0.3s',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 12px rgba(99, 102, 241, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(99, 102, 241, 0.3)';
                                }}
                            >
                                <MessageCircle size={20} />
                                AI 상담 기록 보기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DetailItem = ({ icon, label, value }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '0.75rem',
        border: '1px solid #e5e7eb'
    }}>
        <div style={{ color: '#9ca3af' }}>{icon}</div>
        <div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>{label}</div>
            <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.875rem' }}>{value}</div>
        </div>
    </div>
);

export default WorkerDetail;
