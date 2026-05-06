import { type FC, useState, useEffect, useRef } from 'react';
import {PModal,
    PHeading,
    PText,
    PButton,
    PInlineNotification,
    PDivider,
    PFlex} from '@porsche-design-system/components-react';
import axios from 'axios';

// API Configuration (can be moved to a shared api file)
const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';

interface KeywordSuggestion {
    term: string;
    weight: number;
    type: string;
}

interface KeywordAnalysisModalProps {
    tenderId: string;
    isOpen: boolean;
    onClose: () => void;
    onKeywordsAdded: () => void; // Callback to refresh tender/keywords
}

export const KeywordAnalysisModal: FC<KeywordAnalysisModalProps> = ({
    tenderId,
    isOpen,
    onClose,
    onKeywordsAdded
}) => {
    // State management
    const [prompt, setPrompt] = useState<string>('');
    const [suggestions, setSuggestions] = useState<KeywordSuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Default prompt instructions
    const defaultInstructions = "Extract important max 10 keywords. Stop words should not be included.";

    useEffect(() => {
        if (isOpen && !prompt) {
            setPrompt(defaultInstructions);
        }
        if (!isOpen) {
            setSuggestions([]);
            setNotification(null);
        }
    }, [isOpen]);

    const handleAnalyze = async () => {
        setLoading(true);
        setNotification(null);
        try {
            const response = await axios.post(`${API_URL}/keywords/analyze/${tenderId}`, {
                prompt: prompt
            });
            setSuggestions(response.data);
            if (response.data.length === 0) {
                setNotification({ type: 'success', message: 'Analysis complete, but no new keywords found.' });
            }
        } catch (error: any) {
            setNotification({
                type: 'error',
                message: error.response?.data?.detail || 'Analysis failed. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveKeywords = async () => {
        setSaving(true);
        setNotification(null);
        let failCount = 0;

        try {
            // Save sequentially to avoid overwhelming the server (optional, but safer)
            // or use Promise.all for speed. Using Promise.all here.
            const promises = suggestions.map(kw =>
                axios.post(`${API_URL}/keywords/`, kw).catch(() => {
                    failCount++;
                    return null;
                })
            );

            await Promise.all(promises);
            const successCount = suggestions.length - failCount;

            setNotification({
                type: successCount > 0 ? 'success' : 'error',
                message: `Saved ${successCount} keywords. ${failCount > 0 ? `${failCount} failed (duplicates?).` : ''}`
            });

            if (successCount > 0) {
                onKeywordsAdded();
                setTimeout(() => {
                    onClose();
                }, 1500);
            }
        } catch (error) {
            setNotification({ type: 'error', message: 'Failed to save keywords.' });
        } finally {
            setSaving(false);
        }
    };

    const removeSuggestion = (index: number) => {
        const newSuggestions = [...suggestions];
        newSuggestions.splice(index, 1);
        setSuggestions(newSuggestions);
    };

    const updateSuggestion = (index: number, field: keyof KeywordSuggestion, value: any) => {
        const newSuggestions = [...suggestions];
        newSuggestions[index] = { ...newSuggestions[index], [field]: value };
        setSuggestions(newSuggestions);
    };

    const modalRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const modalElement = modalRef.current;
        if (modalElement) {
            modalElement.addEventListener('dismiss', onClose);
        }
        return () => {
            if (modalElement) {
                modalElement.removeEventListener('dismiss', onClose);
            }
        };
    }, [onClose]);

    useEffect(() => {
        const notifElement = notificationRef.current;
        const handleDismissNotif = () => setNotification(null);
        if (notifElement) {
            notifElement.addEventListener('dismiss', handleDismissNotif);
        }
        return () => {
            if (notifElement) {
                notifElement.removeEventListener('dismiss', handleDismissNotif);
            }
        };
    }, [notification]);

    return (
        <PModal
            ref={modalRef}
            open={isOpen}
            onDismiss={onClose}
            dismissButton={true}
            aria={{ 'aria-label': 'Analyze Keywords Modal' }}
        >
            <PHeading size="large" slot="header">Analyze Tender Keywords</PHeading>
            <div style={{ padding: '16px', minWidth: '500px' }}>
                <PText style={{ marginBottom: '16px' }}>
                    Use AI to extract relevant keywords from this tender. You can edit the prompt instructions below.
                </PText>

                {/* Prompt Section */}
                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                        AI Instructions
                    </label>
                    <textarea
                        style={{
                            width: '100%',
                            minHeight: '80px',
                            padding: '8px',
                            marginTop: '8px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontFamily: 'inherit'
                        }}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />

                    <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                        <PButton
                            variant="primary"
                            loading={loading}
                            disabled={loading}
                            onClick={handleAnalyze}
                        >
                            Analyze
                        </PButton>
                    </div>
                </div>

                <PDivider />

                {/* Results Section */}
                <div style={{ marginTop: '24px' }}>
                    <PHeading size="small" style={{ marginBottom: '16px' }}>
                        Suggested Keywords ({suggestions.length})
                    </PHeading>

                    {loading && (
                        <PFlex justifyContent="center" style={{ padding: '20px' }}>
                            <PText>Analyzing...</PText>
                        </PFlex>
                    )}

                    {!loading && suggestions.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                            {suggestions.map((kw, idx) => (
                                <div key={idx} style={{
                                    display: 'flex',
                                    gap: '12px',
                                    alignItems: 'center',
                                    padding: '12px',
                                    backgroundColor: '#f5f5f5',
                                    borderRadius: '4px'
                                }}>
                                    <input
                                        type="text"
                                        value={kw.term}
                                        onChange={(e) => updateSuggestion(idx, 'term', e.target.value)}
                                        style={{ flex: 2, padding: '4px' }}
                                    />
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={kw.weight}
                                        onChange={(e) => updateSuggestion(idx, 'weight', parseFloat(e.target.value))}
                                        style={{ width: '60px', padding: '4px' }}
                                    />
                                    <select
                                        value={kw.type}
                                        onChange={(e) => updateSuggestion(idx, 'type', e.target.value)}
                                        style={{ flex: 1, padding: '4px' }}
                                    >
                                        <option value="Sector">Sector</option>
                                        <option value="Service">Service</option>
                                        <option value="Exclusion">Exclusion</option>
                                    </select>
                                    <PButton
                                        variant="ghost"
                                        hideLabel={true}
                                        icon="close"
                                        type="button"
                                        onClick={() => removeSuggestion(idx)}
                                        aria={{ 'aria-label': 'Remove keyword' }}
                                    >Remove</PButton>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && suggestions.length === 0 && prompt && (
                        <PText style={{ color: '#666', fontStyle: 'italic' }}>
                            Click Analyze to generate suggestions.
                        </PText>
                    )}
                </div>

                {/* Actions */}
                {suggestions.length > 0 && (
                    <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                        <PButton variant="secondary" onClick={onClose} disabled={saving}>Cancel</PButton>
                        <PButton variant="primary" onClick={handleSaveKeywords} loading={saving} disabled={saving}>
                            Save Keywords
                        </PButton>
                    </div>
                )}

                {/* Notifications */}
                {notification && (
                    <div style={{ marginTop: '16px' }}>
                        <PInlineNotification
                            state={notification.type}
                            heading={notification.type === 'success' ? 'Success' : 'Error'}
                            description={notification.message}
                            dismissButton={true}
                            onDismiss={() => setNotification(null)}
                        />
                    </div>
                )}
            </div>
        </PModal>
    );
};
