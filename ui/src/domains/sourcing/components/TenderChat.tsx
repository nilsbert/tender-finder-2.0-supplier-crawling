
import React, { useState, useEffect, useRef } from 'react';
import {PText,
    PHeading,
    PButton,
    PTextFieldWrapper,
    PSpinner,
    PInlineNotification,
    
    PGrid,
    PGridItem} from '@porsche-design-system/components-react';
import ReactMarkdown from 'react-markdown';
import { api as enrichingApi } from '../../enriching/api';

interface Message {
    role: 'user' | 'model';
    content: string;
    timestamp: number;
}

interface TenderChatProps {
    tenderId: string;
    tenderInternalId: string;
    isEnriched: boolean;
    onEnrichRequest: () => void;
    isEnriching: boolean;
}

export const TenderChat: React.FC<TenderChatProps> = ({
    tenderId,
    tenderInternalId,
    isEnriched,
    onEnrichRequest,
    isEnriching
}) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load history from local storage on mount
    useEffect(() => {
        const savedHistory = localStorage.getItem(`chat_history_${tenderInternalId}`);
        if (savedHistory) {
            try {
                setMessages(JSON.parse(savedHistory));
            } catch (e) {
                console.error("Failed to parse chat history", e);
            }
        } else {
            setMessages([]);
        }
    }, [tenderInternalId]);

    // Save history to local storage whenever it changes
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem(`chat_history_${tenderInternalId}`, JSON.stringify(messages));
        }
    }, [messages, tenderInternalId]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { role: 'user', content: input, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);
        setError(null);

        try {
            // Prepare history for API (exclude timestamps, map roles if needed)
            const apiHistory = messages.map(m => ({
                role: m.role, // 'user' or 'model' usually matches what we need
                content: m.content
            }));

            const response = await enrichingApi.chatWithTender(tenderId, apiHistory, userMsg.content);

            const botMsg: Message = {
                role: 'model',
                content: response.answer,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (err: any) {
            console.error("Chat error:", err);
            // Special handling for not enriched error if API wraps it
            if (err.message && err.message.includes('TENDER_NOT_ENRICHED')) {
                setError("This tender needs to be enriched before you can chat with it.");
            } else {
                setError("Sorry, I couldn't get an answer. Please try again.");
                // Optional: remove user message or mark as failed
            }
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // --- Render: Not Enriched State ---
    if (!isEnriched && messages.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#f2f2f2', borderRadius: '4px' }}>
                <PHeading tag="h3" size="large">Enrichment Required</PHeading>
                <PText style={{ margin: '1rem 0' }}>
                    To chat with this tender, we first need to analyze it using AI.
                    This process extracts key data and summaries.
                </PText>

                {isEnriching ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <PSpinner />
                        <PText>Enriching tender... this usually takes 30-60 seconds.</PText>
                    </div>
                ) : (
                    <PButton variant="primary" onClick={onEnrichRequest}>Enrich Now</PButton>
                )}
            </div>
        );
    }

    // --- Render: Chat Interface ---
    return (
        <PGrid>
            <PGridItem size={12}>

                {/* Header / Info */}
                {!isEnriched && (
                    <PInlineNotification state="warning" heading="Enrichment Pending">
                        This tender is being enriched in the background. Some answers might be incomplete until finished.
                    </PInlineNotification>
                )}

                {/* Message Area */}
                <div style={{
                    height: '500px',
                    overflowY: 'auto',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    padding: '1rem',
                    marginBottom: '1rem',
                    backgroundColor: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    {messages.length === 0 && (
                        <div style={{ textAlign: 'center', color: '#666', marginTop: '200px' }}>
                            <PText>Ask a question about this tender (e.g., "What is the deadline?", "Summarize risks").</PText>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div key={idx} style={{
                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            backgroundColor: msg.role === 'user' ? '#e5ebf5' : '#f9f9f9', // Porsche-like colors
                            color: '#000',
                            padding: '1rem',
                            borderRadius: '8px',
                            borderBottomRightRadius: msg.role === 'user' ? '0' : '8px',
                            borderBottomLeftRadius: msg.role === 'model' ? '0' : '8px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                            <PText size="x-small" style={{ fontWeight: 'bold', marginBottom: '0.2rem', color: '#666' }}>
                                {msg.role === 'user' ? 'You' : 'Tender Assistant'}
                            </PText>
                            <div className="markdown-body" style={{ fontSize: '0.95rem' }}>
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div style={{ alignSelf: 'flex-start', padding: '1rem' }}>
                            <PSpinner size="inherit" /> <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem' }}>Thinking...</span>
                        </div>
                    )}

                    {error && (
                        <PInlineNotification state="error" heading="Error">
                            {error}
                        </PInlineNotification>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <PTextFieldWrapper label="Your Question">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your message here..."
                                disabled={loading}
                            />
                        </PTextFieldWrapper>
                    </div>
                    <div style={{ paddingTop: '24px' }}> {/* Align with input box */}
                        <PButton
                            variant="primary"
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            icon="chat"
                        >
                            Send
                        </PButton>
                    </div>
                    {messages.length > 0 && (
                        <div style={{ paddingTop: '24px' }}>
                            <PButton
                                variant="ghost"
                                icon="delete"
                                onClick={() => {
                                    if (confirm("Clear chat history?")) {
                                        setMessages([]);
                                        localStorage.removeItem(`chat_history_${tenderInternalId}`);
                                    }
                                }}
                                disabled={loading}
                            >
                                Clear
                            </PButton>
                        </div>
                    )}
                </div>

            </PGridItem>
        </PGrid>
    );
};
