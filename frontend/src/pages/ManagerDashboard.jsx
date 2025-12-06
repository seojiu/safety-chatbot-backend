import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, AlertTriangle, CheckCircle, Search, TrendingUp, Shield, Activity, UserCheck, Settings, X, Save, FileText, Lightbulb, BarChart2, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import API_BASE_URL from '../config';

const ManagerDashboard = () => {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'list'

    // Settings State
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState({
        industry: 3,
        company_size: 4
    });

    const [savingSettings, setSavingSettings] = useState(false);

    // Report State
    const [reportData, setReportData] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);

    useEffect(() => {
        fetchWorkers();
        fetchSettings();
    }, []);

    const fetchWorkers = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/workers`);
            setWorkers(res.data);
        } catch (error) {
            console.error("Error fetching workers:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/admin/settings`);
            setSettings(res.data);
        } catch (error) {
            console.error("Error fetching settings:", error);
        }
    };

    const handleSaveSettings = async () => {
        setSavingSettings(true);
        try {
            await axios.post(`${API_BASE_URL}/api/admin/settings`, {
                industry: parseInt(settings.industry),
                company_size: parseInt(settings.company_size)
            });
            alert("설정이 저장되고 모든 데이터가 업데이트되었습니다.");
            setShowSettings(false);
            fetchWorkers(); // Refresh data to show new risks
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("설정 저장 중 오류가 발생했습니다.");
        } finally {
            setSavingSettings(false);
        }
    };

    const fetchReport = async () => {
        setReportLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/admin/report`);
            setReportData(res.data);
        } catch (error) {
            console.error("Error fetching report:", error);
            alert("리포트 생성 중 오류가 발생했습니다.");
        } finally {
            setReportLoading(false);
        }
    };

    const filteredWorkers = workers
        .filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => b.risk_prob - a.risk_prob); // Sort by risk_prob descending (highest first)

    // Calculate statistics
    const totalWorkers = workers.length;
    const highRiskWorkers = workers.filter(w => w.risk_prob >= 50).length;
    const mediumRiskWorkers = workers.filter(w => w.risk_prob >= 20 && w.risk_prob < 50).length;
    const lowRiskWorkers = workers.filter(w => w.risk_prob < 20).length;
    const avgRisk = workers.length > 0 ? (workers.reduce((sum, w) => sum + w.risk_prob, 0) / workers.length).toFixed(1) : 0;

    // Pie Chart Data
    const pieData = [
        { name: '고위험군', value: highRiskWorkers, color: '#ef4444' },
        { name: '중위험군', value: mediumRiskWorkers, color: '#f59e0b' },
        { name: '저위험군', value: lowRiskWorkers, color: '#10b981' },
    ].filter(d => d.value > 0); // Only show segments with data

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', padding: '0.75rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                                <Shield style={{ color: 'white' }} size={28} />
                            </div>
                            <div>
                                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>안전 관리 대시보드</h1>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>실시간 근로자 위험도 모니터링</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowSettings(true)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.75rem 1.5rem', borderRadius: '0.75rem',
                            backgroundColor: 'white', color: '#4b5563',
                            border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                        <Settings size={18} />
                        전역 설정 관리
                    </button>
                </div>

            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #e5e7eb' }}>
                <button
                    onClick={() => setActiveTab('dashboard')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: activeTab === 'dashboard' ? '#4f46e5' : '#6b7280',
                        borderBottom: activeTab === 'dashboard' ? '2px solid #4f46e5' : '2px solid transparent',
                        background: 'none',
                        borderTop: 'none',
                        borderLeft: 'none',
                        borderRight: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    대시<br />보드
                </button>
                <button
                    onClick={() => setActiveTab('list')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: activeTab === 'list' ? '#4f46e5' : '#6b7280',
                        borderBottom: activeTab === 'list' ? '2px solid #4f46e5' : '2px solid transparent',
                        background: 'none',
                        borderTop: 'none',
                        borderLeft: 'none',
                        borderRight: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    근로자<br />목록
                </button>

                <button
                    onClick={() => setActiveTab('report')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: activeTab === 'report' ? '#4f46e5' : '#6b7280',
                        borderBottom: activeTab === 'report' ? '2px solid #4f46e5' : '2px solid transparent',
                        background: 'none',
                        borderTop: 'none',
                        borderLeft: 'none',
                        borderRight: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    AI 안전<br />리포트
                </button>
            </div>

            {/* Dashboard View */}
            {
                activeTab === 'dashboard' && (
                    <>
                        {/* Statistics Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            <StatCard icon={<Users size={20} />} title="전체 근로자" value={totalWorkers} color="#3b82f6" subtitle="등록된 인원" />
                            <StatCard icon={<AlertTriangle size={20} />} title="고위험군" value={highRiskWorkers} color="#ef4444" subtitle="50% 이상" />
                            <StatCard icon={<Activity size={20} />} title="중위험군" value={mediumRiskWorkers} color="#f59e0b" subtitle="20-50%" />
                            <StatCard icon={<UserCheck size={20} />} title="저위험군" value={lowRiskWorkers} color="#10b981" subtitle="20% 미만" />
                        </div>

                        {/* Charts Section */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                            {/* Average Risk Card */}
                            <div style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                            <TrendingUp style={{ color: 'white' }} size={22} />
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', margin: '0 0 0.25rem 0' }}>평균 위험도</h3>
                                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>{avgRisk}%</p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0 0 0.25rem 0' }}>전체 근로자 기준</p>
                                        <p style={{ fontSize: '1rem', fontWeight: 'bold', color: avgRisk >= 20 ? '#ef4444' : '#10b981', margin: 0 }}>
                                            {avgRisk >= 20 ? '⚠️ 주의 필요' : '✅ 양호'}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ height: '10px', backgroundColor: '#f3f4f6', borderRadius: '9999px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${Math.min(avgRisk, 100)}%`, backgroundColor: avgRisk >= 50 ? '#ef4444' : avgRisk >= 20 ? '#f59e0b' : '#10b981', transition: 'width 0.5s' }}></div>
                                </div>
                            </div>

                            {/* Risk Distribution Pie Chart */}
                            <div style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem', border: '1px solid #e5e7eb', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>위험도 분포</h3>
                                <div style={{ flex: 1, minHeight: '250px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `${value}명`} />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </>
                )
            }

            {/* AI Report View */}
            {activeTab === 'report' && (
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>AI 안전 분석 리포트</h2>
                        <p style={{ color: '#6b7280' }}>전체 근로자 데이터를 기반으로 AI가 분석한 안전 현황입니다.</p>
                    </div>

                    {!reportData && !reportLoading && (
                        <div style={{ textAlign: 'center', padding: '4rem 0', backgroundColor: 'white', borderRadius: '1rem', border: '2px dashed #d1d5db' }}>
                            <div style={{ width: '4rem', height: '4rem', backgroundColor: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                <FileText style={{ color: '#9ca3af' }} size={32} />
                            </div>
                            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>아직 생성된 리포트가 없습니다.</p>
                            <button
                                onClick={fetchReport}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#4f46e5',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <RefreshCw size={18} />
                                리포트 생성하기
                            </button>
                        </div>
                    )}

                    {reportLoading && (
                        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                            <div style={{ display: 'inline-block', width: '3rem', height: '3rem', border: '4px solid #e5e7eb', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            <p style={{ marginTop: '1rem', color: '#6b7280', fontWeight: '500' }}>AI가 데이터를 분석하고 있습니다...</p>
                            <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>잠시만 기다려주세요 (약 10-20초 소요)</p>
                            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                        </div>
                    )}

                    {reportData && !reportLoading && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Briefing Section */}
                            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', borderLeft: '6px solid #4f46e5' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <Shield size={24} color="#4f46e5" />
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>종합 안전 브리핑</h3>
                                </div>
                                <p style={{ fontSize: '1.125rem', lineHeight: '1.75', color: '#374151' }}>
                                    {reportData.briefing}
                                </p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                {/* Trends Section */}
                                <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f3f4f6' }}>
                                        <BarChart2 size={20} color="#f59e0b" />
                                        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>주요 위험 트렌드</h3>
                                    </div>
                                    <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
                                        {reportData.trends}
                                    </p>
                                </div>

                                {/* Suggestions Section */}
                                <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f3f4f6' }}>
                                        <Lightbulb size={20} color="#10b981" />
                                        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>개선 제안</h3>
                                    </div>
                                    <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
                                        {reportData.suggestions}
                                    </p>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right', marginTop: '1rem' }}>
                                <button
                                    onClick={fetchReport}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        backgroundColor: 'white',
                                        color: '#6b7280',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <RefreshCw size={14} />
                                    리포트 재생성
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}



            {/* Worker List View */}
            {
                activeTab === 'list' && (
                    <>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                                <p style={{ color: '#6b7280' }}>데이터를 불러오는 중...</p>
                            </div>
                        ) : (
                            <>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    {/* Title and Count - Title Centered, Count Right */}
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>근로자 목록</h2>
                                        <span style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '0.375rem 0.75rem', borderRadius: '9999px', fontWeight: '500' }}>
                                            총 {filteredWorkers.length}명
                                        </span>
                                    </div>

                                    {/* Search Bar - Centered */}
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                                            <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={18} />
                                            <input
                                                type="text"
                                                placeholder="근로자 이름 검색..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    paddingLeft: '2.5rem',
                                                    paddingRight: '1rem',
                                                    paddingTop: '0.625rem',
                                                    paddingBottom: '0.625rem',
                                                    border: '2px solid #e5e7eb',
                                                    borderRadius: '0.75rem',
                                                    outline: 'none',
                                                    fontSize: '0.875rem',
                                                    backgroundColor: 'white'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                    {filteredWorkers.map((worker, index) => (
                                        <WorkerCard key={worker.id} worker={worker} index={index} />
                                    ))}

                                    {filteredWorkers.length === 0 && (
                                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 0', backgroundColor: 'white', borderRadius: '1rem', border: '2px dashed #d1d5db' }}>
                                            <div style={{ width: '4rem', height: '4rem', backgroundColor: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                                <Users style={{ color: '#9ca3af' }} size={32} />
                                            </div>
                                            <p style={{ color: '#6b7280', fontWeight: '500', margin: '0 0 0.5rem 0' }}>등록된 근로자가 없습니다</p>
                                            <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>근로자가 설문을 완료하면 여기에 표시됩니다</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </>
                )
            }



            {/* Settings Modal */}
            {
                showSettings && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
                    }}>
                        <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', width: '90%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937' }}>전역 설정 관리</h2>
                                <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div style={{ marginBottom: '1.5rem', backgroundColor: '#fff7ed', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #ffedd5' }}>
                                <p style={{ fontSize: '0.875rem', color: '#c2410c', margin: 0 }}>
                                    ⚠️ 주의: 이곳에서 설정을 변경하면 <strong>모든 근로자</strong>의 정보가 일괄 업데이트되며, 위험도가 재계산됩니다.
                                </p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>산업 대분류</label>
                                    <select
                                        value={settings.industry}
                                        onChange={(e) => setSettings({ ...settings, industry: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}
                                    >
                                        <option value={2}>광업</option>
                                        <option value={3}>제조업</option>
                                        <option value={4}>전기, 가스, 증기 및 공기 조절 공급</option>
                                        <option value={5}>수도, 하수 및 폐기물 처리, 원료 재생</option>
                                        <option value={6}>건설업</option>
                                        <option value={8}>운수 및 창고업</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>종사자 수</label>
                                    <select
                                        value={settings.company_size}
                                        onChange={(e) => setSettings({ ...settings, company_size: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}
                                    >
                                        <option value={2}>2~4명</option>
                                        <option value={3}>5~9명</option>
                                        <option value={4}>10~29명</option>
                                        <option value={5}>30~49명</option>
                                        <option value={6}>50~99명</option>
                                        <option value={7}>100~249명</option>
                                        <option value={8}>250~299명</option>
                                        <option value={9}>300~499명</option>
                                        <option value={10}>500~999명</option>
                                        <option value={11}>1,000명~1,999명</option>
                                        <option value={12}>2,000명 이상</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => setShowSettings(false)}
                                    disabled={savingSettings}
                                    style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', backgroundColor: 'white', color: '#374151', cursor: 'pointer' }}
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleSaveSettings}
                                    disabled={savingSettings}
                                    style={{
                                        padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none',
                                        backgroundColor: '#4f46e5', color: 'white', fontWeight: '600', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: savingSettings ? 0.7 : 1
                                    }}
                                >
                                    {savingSettings ? '저장 중...' : <><Save size={18} /> 설정 저장 및 적용</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

// Stat Card Component
const StatCard = ({ icon, title, value, color, subtitle }) => {
    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '1.25rem',
            border: '1px solid #e5e7eb',
            transition: 'box-shadow 0.3s',
            cursor: 'default'
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                    <p style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: '500', margin: '0 0 0.5rem 0' }}>{title}</p>
                    <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 0.25rem 0' }}>{value}</p>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>{subtitle}</p>
                </div>
                <div style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`, padding: '0.625rem', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <div style={{ color: 'white' }}>{icon}</div>
                </div>
            </div>
        </div>
    );
};

// Worker Card Component
const WorkerCard = ({ worker, index }) => {
    const navigate = useNavigate();

    const getRiskLevel = (prob) => {
        if (prob >= 50) return {
            label: '고위험',
            bgColor: '#fef2f2',
            textColor: '#dc2626',
            borderColor: '#fecaca',
            gradientBar: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'
        };
        if (prob >= 20) return {
            label: '중위험',
            bgColor: '#fffbeb',
            textColor: '#d97706',
            borderColor: '#fed7aa',
            gradientBar: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
        };
        return {
            label: '저위험',
            bgColor: '#f0fdf4',
            textColor: '#16a34a',
            borderColor: '#bbf7d0',
            gradientBar: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)'
        };
    };

    const riskLevel = getRiskLevel(worker.risk_prob);

    const handleClick = () => {
        navigate(`/manager/worker/${worker.id}`);
    };

    return (
        <div
            onClick={handleClick}
            style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: `2px solid ${riskLevel.borderColor}`,
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.3s',
                marginBottom: '0'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = '#818cf8';
                e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = riskLevel.borderColor;
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            {/* Header */}
            <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                        {worker.name}
                    </h3>
                    <span style={{
                        backgroundColor: riskLevel.bgColor,
                        color: riskLevel.textColor,
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                    }}>
                        {worker.risk_prob >= 20 ? <AlertTriangle size={10} /> : <CheckCircle size={10} />}
                        {riskLevel.label}
                    </span>
                </div>
            </div>

            {/* Risk Progress */}
            <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280' }}>위험도</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: riskLevel.textColor }}>
                        {worker.risk_prob.toFixed(1)}%
                    </span>
                </div>

                <div style={{ position: 'relative' }}>
                    <div style={{ width: '100%', backgroundColor: '#f3f4f6', borderRadius: '9999px', height: '0.5rem', overflow: 'hidden' }}>
                        <div
                            style={{
                                height: '0.5rem',
                                borderRadius: '9999px',
                                background: riskLevel.gradientBar,
                                width: `${Math.min(worker.risk_prob, 100)}%`,
                                transition: 'width 0.5s'
                            }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Type Badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #e5e7eb' }}>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: '500' }}>예측 유형</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#374151', backgroundColor: '#f3f4f6', padding: '0.25rem 0.75rem', borderRadius: '0.375rem' }}>
                    {worker.risk_type}
                </span>
            </div>
        </div>
    );
};

export default ManagerDashboard;
