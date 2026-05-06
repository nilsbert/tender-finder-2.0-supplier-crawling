import React, { useState, useEffect } from 'react';
import {PHeading,
    PFlex,
    PFlexItem,
    PText,
    PInlineNotification,
    PButton} from '@porsche-design-system/components-react';
import { api, EnrichmentStatus, QueueItem } from './api';

export const EnrichmentDashboard: React.FC = () => {
    const [status, setStatus] = useState<EnrichmentStatus | null>(null);
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const [statusData, queueData] = await Promise.all([
                api.getStatus(),
                api.getQueue()
            ]);
            setStatus(statusData);
            setQueue(queueData);
            setError(null);
        } catch (e) {
            console.error("Failed to fetch enrichment status", e);
            // Don't overwrite existing data on transient error if polling
            if (!status) setError("Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, []);

    if (loading && !status) {
        return <div className="p-content-wrapper"><PText>Loading status...</PText></div>;
    }

    if (error && !status) {
        return (
            <div className="p-content-wrapper">
                <PInlineNotification state="error" heading="Error" description={error} />
            </div>
        );
    }

    return (
        <div className="p-content-wrapper">
            <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <PFlex alignItems="center" justifyContent="space-between">
                    <PHeading size="large">Enrichment Worker Dashboard</PHeading>
                    <PButton variant="tertiary" icon="refresh" onClick={fetchData}>Refresh</PButton>
                </PFlex>

                {/* KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>

                    <StatusCard
                        label="Active Workers"
                        value={status?.active_workers.toString() || '0'}
                        state={status?.active_workers && status.active_workers > 0 ? 'success' : 'neutral'}
                    />

                    <StatusCard
                        label="Queue Depth"
                        value={status?.queue_depth.toString() || '0'}
                        state={status && status.queue_depth > 100 ? 'warning' : 'neutral'}
                    />

                    <StatusCard
                        label="Total Processed"
                        value={status?.total_processed.toString() || '0'}
                    />

                    <StatusCard
                        label="Failed Items"
                        value={status?.failed_count.toString() || '0'}
                        state={status && status.failed_count > 0 ? 'error' : 'success'}
                    />

                </div>

                {/* Rate Limit Warning */}
                {status?.rate_limit_paused && (
                    <PInlineNotification
                        state="warning"
                        heading="Rate Limit Paused"
                        description="Enrichment is currently paused due to AI provider rate limits. It will resume automatically."
                    />
                )}

                {/* Queue List */}
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '4px' }}>
                    <PHeading size="medium" style={{ marginBottom: '16px' }}>Active Queue ({queue.length})</PHeading>
                    {queue.length === 0 ? (
                        <PText color="muted">No items currently processing or queued.</PText>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #eee' }}>
                                    <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
                                    <th style={{ textAlign: 'left', padding: '8px' }}>Tender ID</th>
                                    <th style={{ textAlign: 'left', padding: '8px' }}>Headline</th>
                                    <th style={{ textAlign: 'left', padding: '8px' }}>Enqueued</th>
                                </tr>
                            </thead>
                            <tbody>
                                {queue.map((item) => (
                                    <tr key={item.tender_id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td style={{ padding: '8px' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                backgroundColor: item.status === 'PROCESSING' ? '#e1f5fe' : '#f5f5f5',
                                                color: item.status === 'PROCESSING' ? '#0277bd' : '#666'
                                            }}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '8px', fontSize: '14px' }}>{item.tender_id.substring(0, 8)}...</td>
                                        <td style={{ padding: '8px', fontSize: '14px' }}>{item.headline?.substring(0, 50)}...</td>
                                        <td style={{ padding: '8px', fontSize: '14px', color: '#666' }}>
                                            {item.enqueued_at ? new Date(item.enqueued_at).toLocaleTimeString() : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatusCard: React.FC<{ label: string; value: string; state?: 'neutral' | 'success' | 'warning' | 'error' }> = ({ label, value, state = 'neutral' }) => {
    let color = '#333';
    if (state === 'success') color = '#2e7d32'; // Green
    if (state === 'warning') color = '#ed6c02'; // Orange
    if (state === 'error') color = '#d32f2f';   // Red

    return (
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '4px', borderLeft: `4px solid ${color}` }}>
            <PText size="x-small" style={{ textTransform: 'uppercase', color: '#666', marginBottom: '8px' }}>{label}</PText>
            <PHeading size="large" style={{ color: color }}>{value}</PHeading>
        </div>
    );
};
