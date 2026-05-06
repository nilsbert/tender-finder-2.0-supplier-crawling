import { type FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {PHeading, PButton, PFlex, PInlineNotification, PModal, PText} from '@porsche-design-system/components-react';
import { TenderDetailContent } from './components/TenderDetailContent';
import { api } from './api';
import { useAuth } from '../auth/AuthProvider';

import { api as ratingApi } from '../rating/api';
import { distributingApi } from '../distributing/api/distributingApi';

export const TenderDetailPage: FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { identity } = useAuth();
    const [tender, setTender] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [enriching, setEnriching] = useState(false);
    const [scoring, setScoring] = useState(false);
    const [sendingToTeams, setSendingToTeams] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ message: string; state: 'success' | 'error' } | null>(null);

    const fetchTender = async () => {
        if (!id) return;
        try {
            // Don't set global loading on re-fetch to keep UI stable
            const data = await api.getTender(id);
            setTender(data);
            return data;
        } catch (err) {
            console.error('Failed to fetch tender', err);
            setError('Failed to load tender details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchTender();
    }, [id]);

    const handleEnrich = async () => {
        if (!id) return;
        try {
            setEnriching(true);
            await ratingApi.enrichTender(id);
            setNotification({ message: 'Enrichment started via background job.', state: 'success' });
            // Ideally poll/websocket, but for now just wait or re-fetch
            setTimeout(fetchTender, 2000);
        } catch (err) {
            setNotification({ message: 'Failed to start enrichment.', state: 'error' });
        } finally {
            setEnriching(false);
        }
    };

    const handleScore = async () => {
        if (!id) return;
        try {
            setScoring(true);
            await ratingApi.rateTender(id);
            setNotification({ message: 'Scoring updated.', state: 'success' });
            await fetchTender();
        } catch (err) {
            setNotification({ message: 'Failed to update score.', state: 'error' });
        } finally {
            setScoring(false);
        }
    };

    // Helper to poll for enrichment completion
    const waitForEnrichment = async (tenderId: string, maxAttempts = 10): Promise<boolean> => {
        for (let i = 0; i < maxAttempts; i++) {
            await new Promise(r => setTimeout(r, 2000)); // Wait 2s
            const freshTender = await api.getTender(tenderId);
            if (freshTender?.ai_enriched_at) {
                setTender(freshTender);
                return true;
            }
        }
        return false;
    };

    const handleSendToTeams = async () => {
        if (!id || !tender) return;
        try {
            setSendingToTeams(true);

            // 1. Check if enriched. If not, trigger enrichment first.
            if (!tender.ai_enriched_at) {
                setNotification({ message: 'Enriching tender before sending...', state: 'success' });
                await ratingApi.enrichTender(id);

                // Wait for enrichment to complete
                const enriched = await waitForEnrichment(id);
                if (!enriched) {
                    throw new Error("Enrichment timed out. Please try again later.");
                }
            }

            // 2. Send to Teams
            await distributingApi.distributeTender(id);
            setNotification({ message: 'Sent to MS Teams successfully.', state: 'success' });

        } catch (err: any) {
            console.error("Failed to send to Teams", err);
            setNotification({ message: err.message || 'Failed to send to MS Teams.', state: 'error' });
        } finally {
            setSendingToTeams(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        try {
            await api.deleteTender(id);
            navigate('/sourcing/analysis'); // Redirect to dashboard/list
        } catch (err) {
            setNotification({ message: 'Failed to delete tender.', state: 'error' });
            setDeleteModalOpen(false);
        }
    };

    const handleFeedback = async (direction: 'up' | 'down') => {
        if (!id) return;
        try {
            setNotification({ message: 'Applying feedback...', state: 'success' });
            await ratingApi.giveFeedback(id, direction);
            setNotification({ message: 'Feedback processed and new keywords added!', state: 'success' });
            await fetchTender();
        } catch (err) {
            setNotification({ message: 'Failed to apply feedback.', state: 'error' });
        }
    };

    if (loading) {
        return (
            <div className="p-content-wrapper">
                <div style={{ padding: '48px 0', textAlign: 'center' }}>
                    <PHeading>Loading Tender...</PHeading>
                </div>
            </div>
        );
    }

    if (error || !tender) {
        return (
            <div className="p-content-wrapper">
                <div style={{ padding: '48px 0', textAlign: 'center' }}>
                    <PHeading color="inherit" style={{ color: 'var(--tf-danger)' }}>Error</PHeading>
                    <p>{error || 'Tender not found'}</p>
                    <PButton style={{ marginTop: '16px' }} onClick={() => navigate('/sourcing/analysis')}>
                        Back to Analysis
                    </PButton>
                </div>
            </div>
        );
    }

    return (
        <div className="p-content-wrapper">
            <div style={{ padding: '24px 0' }}>
                <PFlex justifyContent="space-between" alignItems="center" style={{ marginBottom: '24px' }}>
                    <PButton variant="ghost" icon="arrow-left" onClick={() => navigate(-1)}>
                        Back
                    </PButton>

                    {identity?.isAdmin && (
                        <PFlex style={{ gap: '1rem' }}>
                            <PButton variant="primary" icon="delete" onClick={() => setDeleteModalOpen(true)}>
                                Delete
                            </PButton>
                        </PFlex>
                    )}
                </PFlex>

                {notification && (
                    <div style={{ marginBottom: '1rem' }}>
                        <PInlineNotification
                            state={notification.state}
                            heading={notification.state === 'success' ? 'Success' : 'Error'}
                            dismissButton={true}
                            onDismiss={() => setNotification(null)}
                        >
                            {notification.message}
                        </PInlineNotification>
                    </div>
                )}

                <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '8px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                    <TenderDetailContent
                        tender={tender}
                        onEnrich={identity?.isAdmin ? handleEnrich : undefined}
                        isEnriching={enriching}
                        onScore={identity?.isAdmin ? handleScore : undefined}
                        isScoring={scoring}
                        onSendToTeams={identity?.isAdmin ? handleSendToTeams : undefined}
                        isSendingToTeams={sendingToTeams}
                        onFeedback={identity?.isAdmin ? handleFeedback : undefined}
                    />
                </div>

                <PModal
                    open={deleteModalOpen}
                    onDismiss={() => setDeleteModalOpen(false)}
                    aria={{ 'aria-label': 'Delete Tender Modal' }}
                >
                    <PHeading size="large" slot="header">Delete Tender</PHeading>
                    <PText>Are you sure you want to permanently delete this tender?</PText>
                    <PFlex style={{ marginTop: '2rem', gap: '1rem' }} justifyContent="flex-end">
                        <PButton variant="ghost" onClick={() => setDeleteModalOpen(false)}>Cancel</PButton>
                        <PButton variant="primary" onClick={handleDelete}>Delete Permanently</PButton>
                    </PFlex>
                </PModal>
            </div>
        </div>
    );
};
