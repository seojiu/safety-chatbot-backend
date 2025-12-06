import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ClipboardCheck, TrendingUp, Calendar, LogOut, AlertTriangle, CheckCircle } from 'lucide-react';
import API_BASE_URL from '../config';

const WorkerHome = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [lastSurvey, setLastSurvey] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/worker/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Fetch last survey
        if (parsedUser.id) {
            fetchLastSurvey(parsedUser.id);
        }
    }, [navigate]);

    const fetchLastSurvey = async (userId) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/users/${userId}/surveys`);
            if (res.data && res.data.length > 0) {
                setLastSurvey(res.data[0]); // Most recent survey
            }
        } catch (error) {
            console.error("Error fetching surveys:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    const getRiskLevel = (prob) => {
        if (prob >= 50) return { label: '고위험', color: '#dc2626', bgColor: '#fef2f2' };
        if (prob >= 20) return { label: '중위험', color: '#d97706', bgColor: '#fffbeb' };
        return { label: '저위험', color: '#16a34a', bgColor: '#f0fdf4' };
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>로딩 중...</p>
            </div>
        );
    }

    const riskLevel = lastSurvey ? getRiskLevel(lastSurvey.risk_prob) : null;

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 'bold', color: '#1f2937', margin: '0 0 0.5rem 0' }}>
                            안녕하세요, {user?.basic_info?.name || user?.username}님!
                        </h1>
                        <p style={{ fontSize: '1rem', color: '#6b7280', margin: 0 }}>
                            안전한 작업 환경을 위해 정기적인 진단을 받아보세요
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => navigate('/worker/profile')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.25rem',
                                backgroundColor: 'white',
                                color: '#4b5563',
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.75rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#6366f1';
                                e.currentTarget.style.color = '#6366f1';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e5e7eb';
                                e.currentTarget.style.color = '#4b5563';
                            }}
                        >
                            <ClipboardCheck size={18} />
                            내 정보 수정
                        </button>
                        <button
                            onClick={handleLogout}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.25rem',
                                backgroundColor: 'white',
                                color: '#6b7280',
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.75rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#dc2626';
                                e.currentTarget.style.color = '#dc2626';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e5e7eb';
                                e.currentTarget.style.color = '#6b7280';
                            }}
                        >
                            <LogOut size={18} />
                            로그아웃
                        </button>
                    </div>
                </div>

                {/* Last Survey Card */}
                {lastSurvey ? (
                    <div style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem', marginBottom: '2rem', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 0.5rem 0' }}>
                                    최근 진단 결과
                                </h2>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Calendar size={16} />
                                    {formatDate(lastSurvey.timestamp)}
                                </p>
                            </div>
                            <div style={{
                                backgroundColor: riskLevel.bgColor,
                                color: riskLevel.color,
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                {lastSurvey.risk_prob >= 20 ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                                {riskLevel.label}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
                                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>위험도</p>
                                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: riskLevel.color, margin: 0 }}>
                                    {lastSurvey.risk_prob.toFixed(1)}%
                                </p>
                            </div>
                            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
                                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>예측 유형</p>
                                <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                                    {lastSurvey.risk_type}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate(`/worker/result/${lastSurvey.id}`)}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: '600',
                                border: 'none',
                                borderRadius: '0.75rem',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px rgba(99, 102, 241, 0.3)',
                                transition: 'all 0.3s'
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
                            상세 결과 보기
                        </button>
                    </div>
                ) : (
                    <div style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '3rem 2rem', marginBottom: '2rem', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                        <TrendingUp style={{ color: '#9ca3af', margin: '0 auto 1rem' }} size={48} />
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 0.5rem 0' }}>
                            아직 진단 기록이 없습니다
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                            첫 안전 진단을 시작해보세요
                        </p>
                    </div>
                )}

                {/* New Survey Button */}
                <div style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem', border: '1px solid #e5e7eb' }}>
                    <div style={{ textAlign: 'center' }}>
                        <ClipboardCheck style={{ color: '#6366f1', margin: '0 auto 1rem' }} size={48} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 0.5rem 0' }}>
                            {lastSurvey ? '새로운 안전 진단' : '안전 진단 시작하기'}
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 1.5rem 0' }}>
                            {lastSurvey
                                ? '정기적인 진단으로 안전한 작업 환경을 유지하세요'
                                : '나의 근무 환경과 건강 상태를 점검하고 AI 분석을 받아보세요'}
                        </p>
                        <button
                            onClick={() => navigate('/worker/survey')}
                            style={{
                                padding: '1rem 2rem',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                fontSize: '1.125rem',
                                fontWeight: '600',
                                border: 'none',
                                borderRadius: '0.75rem',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 12px rgba(16, 185, 129, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 6px rgba(16, 185, 129, 0.3)';
                            }}
                        >
                            진단 시작하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkerHome;
