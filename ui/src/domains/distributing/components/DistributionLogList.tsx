import React, { useEffect, useState } from 'react';
import {PTable,
    PTableHead,
    PTableBody,
    PTableRow,
    PTableHeadCell,
    PTableCell,
    PText,
    PTag,
    PInlineNotification} from '@porsche-design-system/components-react';
import { distributingApi, DistributionLog } from '../api/distributingApi';

export const DistributionLogList: React.FC = () => {
    const [logs, setLogs] = useState<DistributionLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await distributingApi.getLogs();
            if (Array.isArray(data)) {
                setLogs(data);
            } else {
                console.error("Expected array but got:", data);
                setLogs([]);
                // If it's the "Not found" error we saw, show a better message or just empty
                if ((data as any).error === "Not found") {
                    // This is expected if the backend hasn't been updated/restarted
                } else {
                    setError("Received invalid data format from server");
                }
            }
        } catch (e) {
            setError("Failed to load distribution logs");
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleString('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading && logs.length === 0) return <PText>Loading logs...</PText>;

    return (
        <div className="space-y-4">
            {error && <PInlineNotification state="error" heading="Error" description={error} />}

            {logs.length === 0 && !loading ? (
                <PText>No distribution logs found.</PText>
            ) : (
                <PTable caption="Distribution Activity History">
                    <PTableHead>
                        <PTableRow>
                            <PTableHeadCell>Date</PTableHeadCell>
                            <PTableHeadCell>Webhook</PTableHeadCell>
                            <PTableHeadCell>Tender</PTableHeadCell>
                            <PTableHeadCell>Status</PTableHeadCell>
                            <PTableHeadCell>Code</PTableHeadCell>
                        </PTableRow>
                    </PTableHead>
                    <PTableBody>
                        {logs.map((log) => (
                            <PTableRow key={log.id}>
                                <PTableCell>{formatDate(log.sent_at)}</PTableCell>
                                <PTableCell>{log.webhook_name}</PTableCell>
                                <PTableCell>
                                    <span title={log.tender_title} style={{
                                        display: 'block',
                                        maxWidth: '250px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {log.tender_title}
                                    </span>
                                </PTableCell>
                                <PTableCell>
                                    <PTag
                                        color={log.status === 'SENT' ? 'success' : 'error'}
                                        icon={log.status === 'SENT' ? 'check' : 'warning'}
                                    >
                                        {log.status}
                                    </PTag>
                                </PTableCell>
                                <PTableCell>
                                    <span style={{ color: log.response_code && log.response_code >= 400 ? '#ce001e' : 'inherit' }}>
                                        {log.response_code || '-'}
                                    </span>
                                    {log.error_message && (
                                        <div style={{ fontSize: '10px', color: '#ce001e', marginTop: '4px', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {log.error_message}
                                        </div>
                                    )}
                                </PTableCell>
                            </PTableRow>
                        ))}
                    </PTableBody>
                </PTable>
            )}
        </div>
    );
};
