import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Save, ArrowLeft } from 'lucide-react';
import API_BASE_URL from '../config';

const WorkerProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        gender: 1,
        age_group: 30,
        education: 4,
        occupation: 9
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/worker/login');
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        if (parsedUser.basic_info) {
            setFormData({
                name: parsedUser.basic_info.name || '',
                gender: parsedUser.basic_info.gender || 1,
                age_group: parsedUser.basic_info.age_group || 30,
                education: parsedUser.basic_info.education || 4,
                occupation: parsedUser.basic_info.occupation || 9
            });
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'name' ? value : Number(value) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Update backend
            await axios.put(`${API_BASE_URL}/api/users/${user.id}`, {
                basic_info: formData
            });

            // Update local storage
            const updatedUser = { ...user, basic_info: formData };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            alert('정보가 수정되었습니다.');
            navigate('/worker/dashboard');
        } catch (error) {
            console.error("Update error:", error);
            alert("정보 수정 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                <button
                    onClick={() => navigate('/worker/dashboard')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', background: 'none', color: '#6b7280', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.875rem' }}
                >
                    <ArrowLeft size={18} /> 대시보드로 돌아가기
                </button>

                <div style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: '2rem', border: '1px solid #e5e7eb' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)' }}>
                            <User style={{ color: 'white' }} size={32} />
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>내 정보 수정</h1>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <FormField label="이름">
                            <input type="text" name="name" value={formData.name} onChange={handleChange} style={inputStyle} required />
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

                        <button
                            type="submit"
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
                                marginTop: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.3s'
                            }}
                        >
                            {loading ? '저장 중...' : '저장하기'}
                            {!loading && <Save size={20} />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const FormField = ({ label, children }) => (
    <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            {label}
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

export default WorkerProfile;
