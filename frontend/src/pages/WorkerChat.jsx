import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Chatbot from '../components/Chatbot';
import { ArrowLeft, MessageCircle, User } from 'lucide-react';
import API_BASE_URL from '../config';

const WorkerChat = () => {
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

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                {/* Back Button */}
                <button
                    onClick={() => navigate(`/manager/worker/${id}`)}
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
                    상세 정보로 돌아가기
                </button>

                {/* Header Card */}
                <div style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem', marginBottom: '2rem', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            boxShadow: '0 4px 6px rgba(99, 102, 241, 0.3)'
                        }}>
                            <MessageCircle style={{ color: 'white' }} size={28} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 0.25rem 0' }}>
                                AI 안전 상담
                            </h1>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                                <User size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                {worker.name} 님의 맞춤형 안전 상담
                            </p>
                        </div>
                    </div>
                </div>

                {/* Chatbot Card */}
                <div style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
                    <Chatbot workerId={id} />
                </div>

                {/* Info Card */}
                <div style={{
                    marginTop: '1.5rem',
                    backgroundColor: '#eff6ff',
                    padding: '1.25rem',
                    borderRadius: '0.75rem',
                    fontSize: '0.875rem',
                    color: '#1e40af',
                    border: '1px solid #dbeafe'
                }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>💡</span>
                        <div>
                            <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Tip:</strong>
                            <span>이 근로자의 데이터를 바탕으로 AI가 맞춤형 안전 조언을 제공합니다. 구체적인 질문을 하면 더 정확한 답변을 받을 수 있습니다.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkerChat;
