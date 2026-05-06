import React, { useState, useEffect } from 'react';
import {PButton,
    PTag,
    PText} from '@porsche-design-system/components-react';
import { api, type QueueItem } from './api';

const EnrichmentQueueTable: React.FC = () => {
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchQueue = async (bg = false) => {
        if (!bg) setLoading(true);
        else setRefreshing(true);
        try {
            const data = await api.getQueue();
            setQueue(data);
        } catch (error) {
            console.error("Failed to fetch queue", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(() => fetchQueue(true), 5000);
        return () => clearInterval(interval);
    }, []);

    const handleRetry = async (tenderId: string) => {
        setActionLoading(tenderId);
        try {
            await api.retryTender(tenderId);
            await fetchQueue(true); // Immediate update
        } catch (error) {
            console.error("Failed to retry", error);
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusColor = (status: string): 'notification-success' | 'notification-warning' | 'notification-error' | 'background-base' => {
        if (status === 'COMPLETED') return 'notification-success';
        if (status === 'PROCESSING') return 'notification-warning';
        if (status?.startsWith('FAILED')) return 'notification-error';
        return 'background-base';
    };

    if (loading) return <PText>Loading...</PText>;

    if (queue.length === 0) {
        return (
            <div style={{ padding: '24px', textAlign: 'center', background: '#f5f5f5', borderRadius: '4px' }}>
                No active jobs in queue.
            </div>
        );
    }

    return (
        <div style={{ marginTop: '24px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                <caption style={{ textAlign: 'left', padding: '8px', fontSize: '12px', color: '#666' }}>Active Enrichment Queue</caption>
                <thead style={{ backgroundColor: '#fcfcfc', borderBottom: '2px solid #eee' }}>
                    <tr>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '900', color: '#000' }}>Tender ID</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '900', color: '#000' }}>Headline</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '900', color: '#000' }}>Status</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '900', color: '#000' }}>Error / Details</th>
                        <th style={{ padding: '16px', textAlign: 'right', fontWeight: '900', color: '#000' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {queue.map((item) => (
                        <tr key={item.tender_id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ padding: '16px', fontSize: '14px' }}>{item.tender_id}</td>
                            <td style={{ padding: '16px', fontSize: '14px' }}>
                                <div style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {item.headline}
                                </div>
                            </td>
                            <td style={{ padding: '16px', fontSize: '14px' }}>
                                <PTag color={getStatusColor(item.status)}>{item.status}</PTag>
                            </td>
                            <td style={{ padding: '16px', fontSize: '14px' }}>
                                {item.error && (
                                    <span style={{ color: '#d50000', fontSize: '0.9rem' }}>
                                        {item.error}
                                    </span>
                                )}
                            </td>
                            <td style={{ padding: '16px', textAlign: 'right', fontSize: '14px' }}>
                                {item.status.startsWith('FAILED') && (
                                    <PButton
                                        variant="tertiary"
                                        icon="reset"
                                        loading={actionLoading === item.tender_id}
                                        onClick={() => handleRetry(item.tender_id)}
                                        hideLabel
                                    >
                                        Retry
                                    </PButton>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {refreshing && <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '8px' }}>Updating...</div>}
        </div>
    );
};

export default EnrichmentQueueTable;
