import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, User } from 'lucide-react';
import API_BASE_URL from '../config';

const Chatbot = ({ workerId, context }) => {
    const [messages, setMessages] = useState([
        { role: 'bot', text: '안녕하세요! 산업안전 AI 어시스턴트입니다. 무엇을 도와드릴까요?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await axios.post(`${API_BASE_URL}/chat`, {
                message: input,
                worker_id: workerId
            });

            const botMsg = { role: 'bot', text: res.data.response };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: 'bot', text: '죄송합니다. 오류가 발생했습니다.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '600px',
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
        }}>
            {/* Messages Container */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.5rem',
                background: 'linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        style={{
                            display: 'flex',
                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            animation: 'fadeIn 0.3s ease-in'
                        }}
                    >
                        {msg.role === 'bot' && (
                            <div style={{
                                width: '36px',
                                height: '36px',
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '0.75rem',
                                flexShrink: 0,
                                boxShadow: '0 2px 4px rgba(99, 102, 241, 0.3)'
                            }}>
                                <Bot size={20} style={{ color: 'white' }} />
                            </div>
                        )}

                        <div style={{
                            maxWidth: '75%',
                            padding: '1rem 1.25rem',
                            borderRadius: msg.role === 'user' ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
                            background: msg.role === 'user'
                                ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                                : '#ffffff',
                            color: msg.role === 'user' ? '#ffffff' : '#1f2937',
                            boxShadow: msg.role === 'user'
                                ? '0 4px 6px rgba(99, 102, 241, 0.3)'
                                : '0 1px 3px rgba(0,0,0,0.1)',
                            border: msg.role === 'bot' ? '1px solid #e5e7eb' : 'none',
                            fontSize: '0.9375rem',
                            lineHeight: '1.6',
                            wordWrap: 'break-word'
                        }}>
                            {msg.text.split('\n').map((line, i) => (
                                <p key={i} style={{ margin: i > 0 ? '0.5rem 0 0 0' : 0 }}>
                                    {line}
                                </p>
                            ))}
                        </div>

                        {msg.role === 'user' && (
                            <div style={{
                                width: '36px',
                                height: '36px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginLeft: '0.75rem',
                                flexShrink: 0,
                                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
                            }}>
                                <User size={20} style={{ color: 'white' }} />
                            </div>
                        )}
                    </div>
                ))}

                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '0.75rem',
                            flexShrink: 0,
                            boxShadow: '0 2px 4px rgba(99, 102, 241, 0.3)'
                        }}>
                            <Bot size={20} style={{ color: 'white' }} />
                        </div>
                        <div style={{
                            backgroundColor: '#ffffff',
                            padding: '1rem 1.25rem',
                            borderRadius: '1rem 1rem 1rem 0.25rem',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            border: '1px solid #e5e7eb',
                            display: 'flex',
                            gap: '0.375rem',
                            alignItems: 'center'
                        }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                backgroundColor: '#9ca3af',
                                borderRadius: '50%',
                                animation: 'bounce 1.4s infinite ease-in-out both'
                            }} />
                            <div style={{
                                width: '8px',
                                height: '8px',
                                backgroundColor: '#9ca3af',
                                borderRadius: '50%',
                                animation: 'bounce 1.4s infinite ease-in-out both 0.2s'
                            }} />
                            <div style={{
                                width: '8px',
                                height: '8px',
                                backgroundColor: '#9ca3af',
                                borderRadius: '50%',
                                animation: 'bounce 1.4s infinite ease-in-out both 0.4s'
                            }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Container */}
            <div style={{
                padding: '1.25rem',
                backgroundColor: '#ffffff',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'center'
            }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
                    placeholder="궁금한 점을 물어보세요..."
                    disabled={loading}
                    style={{
                        flex: 1,
                        minWidth: 0,
                        padding: '0.875rem 1.125rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        fontSize: '0.9375rem',
                        outline: 'none',
                        transition: 'all 0.3s',
                        backgroundColor: loading ? '#f9fafb' : '#ffffff'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
                <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    style={{
                        background: loading || !input.trim()
                            ? '#d1d5db'
                            : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        color: 'white',
                        padding: '0.875rem 1.125rem',
                        borderRadius: '0.75rem',
                        border: 'none',
                        cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s',
                        boxShadow: loading || !input.trim() ? 'none' : '0 4px 6px rgba(99, 102, 241, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                        if (!loading && input.trim()) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 8px rgba(99, 102, 241, 0.4)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = loading || !input.trim() ? 'none' : '0 4px 6px rgba(99, 102, 241, 0.3)';
                    }}
                >
                    <Send size={20} />
                </button>
            </div>

            <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
        </div>
    );
};

export default Chatbot;
