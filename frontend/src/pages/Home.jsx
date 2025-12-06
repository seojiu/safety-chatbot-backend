import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, ArrowRight } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1rem'
        }}>
            <div style={{
                maxWidth: '500px',
                width: '100%',
                textAlign: 'center'
            }}>
                {/* Logo/Icon */}
                <div style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 2rem',
                    boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)',
                    animation: 'pulse 2s ease-in-out infinite'
                }}>
                    <Shield style={{ color: 'white' }} size={50} />
                </div>

                {/* Title */}
                <h1 style={{
                    fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    margin: '0 0 0.75rem 0',
                    lineHeight: '1.2'
                }}>
                    산업안전 AI 어시스턴트
                </h1>
                <p style={{
                    fontSize: '1.125rem',
                    color: '#6b7280',
                    margin: '0 0 3rem 0',
                    lineHeight: '1.6'
                }}>
                    안전한 작업 환경을 위한<br />스마트한 파트너
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                        onClick={() => navigate('/worker/login')}
                        style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            color: 'white',
                            padding: '1.25rem 2rem',
                            borderRadius: '1rem',
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px rgba(99, 102, 241, 0.3)',
                            transition: 'all 0.3s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem'
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
                        <User size={24} />
                        <span>근로자용 (자가진단)</span>
                        <ArrowRight size={20} />
                    </button>

                    <button
                        onClick={() => navigate('/manager')}
                        style={{
                            width: '100%',
                            backgroundColor: 'white',
                            color: '#374151',
                            padding: '1.25rem 2rem',
                            borderRadius: '1rem',
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            border: '2px solid #e5e7eb',
                            cursor: 'pointer',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#6366f1';
                            e.currentTarget.style.backgroundColor = '#f0f9ff';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                        }}
                    >
                        <Shield size={24} />
                        <span>관리자용 (모니터링)</span>
                        <ArrowRight size={20} />
                    </button>
                </div>

                {/* Footer */}
                <p style={{
                    marginTop: '3rem',
                    fontSize: '0.875rem',
                    color: '#9ca3af'
                }}>
                    © 2024 Industrial Safety AI. All rights reserved.
                </p>
            </div>

            <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
        </div>
    );
};

export default Home;
