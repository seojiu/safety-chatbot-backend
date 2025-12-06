import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Lock, ArrowRight, UserPlus } from 'lucide-react';
import API_BASE_URL from '../config';

const WorkerLogin = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        // For registration
        name: '',
        gender: 1,
        age_group: 30,
        education: 4,
        occupation: 9
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!formData.username || !formData.password) {
            setError('아이디와 비밀번호를 입력해주세요.');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                username: formData.username,
                password: formData.password
            });

            // Save user data to localStorage
            localStorage.setItem('user', JSON.stringify(res.data));
            navigate('/worker/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || '로그인에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!formData.username || !formData.password || !formData.name) {
            setError('모든 필수 항목을 입력해주세요.');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/register`, {
                username: formData.username,
                password: formData.password,
                basic_info: {
                    name: formData.name,
                    gender: Number(formData.gender),
                    age_group: Number(formData.age_group),
                    education: Number(formData.education),
                    occupation: Number(formData.occupation)
                }
            });

            // Save user data to localStorage
            localStorage.setItem('user', JSON.stringify(res.data));
            navigate('/worker/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || '회원가입에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '450px', width: '100%' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)' }}>
                        <User style={{ color: 'white' }} size={40} />
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 0.5rem 0' }}>
                        {isLogin ? '로그인' : '회원가입'}
                    </h1>
                    <p style={{ fontSize: '1rem', color: '#6b7280', margin: 0 }}>
                        {isLogin ? '안전 진단을 시작하세요' : '새 계정을 만드세요'}
                    </p>
                </div>

                {/* Form Card */}
                <div style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: '2rem', border: '1px solid #e5e7eb' }}>
                    <form onSubmit={isLogin ? handleLogin : handleRegister}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Username */}
                            <FormField label="아이디" icon={<User size={18} />}>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="아이디를 입력하세요"
                                    style={inputStyle}
                                    required
                                />
                            </FormField>

                            {/* Password */}
                            <FormField label="비밀번호" icon={<Lock size={18} />}>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="비밀번호를 입력하세요"
                                    style={inputStyle}
                                    required
                                />
                            </FormField>

                            {/* Registration Fields */}
                            {!isLogin && (
                                <>
                                    <FormField label="이름" required>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="홍길동"
                                            style={inputStyle}
                                            required
                                        />
                                    </FormField>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <FormField label="성별">
                                            <select name="gender" value={formData.gender} onChange={handleChange} style={inputStyle}>
                                                <option value={1}>남성</option>
                                                <option value={2}>여성</option>
                                            </select>
                                        </FormField>
                                        <FormField label="연령대">
                                            <select name="age_group" value={formData.age_group} onChange={handleChange} style={inputStyle}>
                                                <option value={20}>20대 이하</option>
                                                <option value={30}>30대</option>
                                                <option value={40}>40대</option>
                                                <option value={50}>50대</option>
                                                <option value={60}>60대 이상</option>
                                            </select>
                                        </FormField>
                                    </div>

                                    <FormField label="학력">
                                        <select name="education" value={formData.education} onChange={handleChange} style={inputStyle}>
                                            <option value={1}>무학/초졸 미만</option>
                                            <option value={2}>초졸</option>
                                            <option value={3}>중졸</option>
                                            <option value={4}>고졸</option>
                                            <option value={5}>전문대졸</option>
                                            <option value={6}>대졸</option>
                                            <option value={7}>대학원 이상</option>
                                        </select>
                                    </FormField>

                                    <FormField label="직업 대분류">
                                        <select name="occupation" value={formData.occupation} onChange={handleChange} style={inputStyle}>
                                            <option value={7}>기능원 및 관련 기능 종사자</option>
                                            <option value={8}>장치/기계 조작 및 조립 종사자</option>
                                            <option value={9}>단순노무 종사자</option>
                                        </select>
                                    </FormField>
                                </>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', border: '1px solid #fecaca' }}>
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    background: loading ? '#d1d5db' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                    color: 'white',
                                    padding: '1rem',
                                    borderRadius: '0.75rem',
                                    fontSize: '1.125rem',
                                    fontWeight: '600',
                                    border: 'none',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    boxShadow: loading ? 'none' : '0 4px 6px rgba(99, 102, 241, 0.3)',
                                    transition: 'all 0.3s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                                onMouseEnter={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 8px 12px rgba(99, 102, 241, 0.4)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 6px rgba(99, 102, 241, 0.3)';
                                }}
                            >
                                {loading ? '처리 중...' : (isLogin ? '로그인' : '회원가입')}
                                {!loading && <ArrowRight size={20} />}
                            </button>
                        </div>
                    </form>

                    {/* Toggle Login/Register */}
                    <div style={{ marginTop: '1.5rem', textAlign: 'center', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                            {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
                        </p>
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#6366f1',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                            }}
                        >
                            {isLogin ? '회원가입하기' : '로그인하기'}
                        </button>
                    </div>
                </div>

                {/* Back to Home */}
                <button
                    onClick={() => navigate('/')}
                    style={{
                        width: '100%',
                        marginTop: '1rem',
                        padding: '0.75rem',
                        backgroundColor: 'transparent',
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color 0.3s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#6366f1'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
                >
                    홈으로 돌아가기
                </button>
            </div>
        </div>
    );
};

const FormField = ({ label, icon, required, children }) => (
    <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            {icon}
            {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
        </label>
        {children}
    </div>
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

export default WorkerLogin;
