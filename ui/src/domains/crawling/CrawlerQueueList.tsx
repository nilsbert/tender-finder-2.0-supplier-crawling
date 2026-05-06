import React, { useEffect, useState } from 'react';
import {PHeading,
    PText,
    PInlineNotification,
    PTag,
    PFlex,
    PFlexItem} from '@porsche-design-system/components-react';
import { api } from './api';

interface QueueJob {
    job_id: string;
    crawler_id: string;
    status: string;
    started_at?: string;
    enqueued_at?: string;
    position?: number;
}

interface QueueStatus {
    active: QueueJob[];
    queued: QueueJob[];
    total_active: number;
    total_queued: number;
    error?: string;
}

export const CrawlerQueueList: React.FC = () => {
    const [status, setStatus] = useState<QueueStatus | null>(null);
    const [schedule, setSchedule] = useState<{ next_run: string | null } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const [queueData, scheduleData] = await Promise.all([
                api.getQueueStatus(),
                api.getScheduleConfig()
            ]);

            if (queueData.error) {
                setError(queueData.error);
            } else {
                setStatus(queueData);
                setError(null);
            }

            setSchedule(scheduleData);
        } catch (e) {
            console.error(e);
            setError("Failed to fetch crawler data");
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Update every 5 seconds
        return () => clearInterval(interval);
    }, []);

    if (error) {
        return <PInlineNotification state="error" heading="Queue Error" description={error} />;
    }

    if (!status) {
        return <PText>Loading crawler jobs & schedule...</PText>;
    }

    const getCrawlerName = (id: string | undefined): string => {
        if (!id) return "Unknown";
        return id.replace(/_/g, ' ').toUpperCase();
    }

    // Sort queued items by position (if available) or enqueued_at
    const sortedQueued = [...status.queued].sort((a, b) => {
        if (a.position !== undefined && b.position !== undefined) return a.position - b.position;
        if (a.enqueued_at && b.enqueued_at) return new Date(a.enqueued_at).getTime() - new Date(b.enqueued_at).getTime();
        return 0;
    });

    const formatDateTime = (dateString: string | null) => {
        if (!dateString) return 'Not scheduled';
        return new Date(dateString).toLocaleString('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div style={{ marginTop: '32px', marginBottom: '32px', padding: '24px', backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
            <PFlex alignItems="center" justifyContent="space-between" style={{ marginBottom: '16px' }}>
                <PFlexItem>
                    <PHeading size="medium">Crawler Jobs & Schedule</PHeading>
                </PFlexItem>
                {schedule?.next_run && (
                    <PFlexItem>
                        <PFlex alignItems="center" style={{ gap: '8px' }}>
                            <PText size="x-small" weight="semi-bold">Next Scheduled Run:</PText>
                            <PTag color="notification-info-soft">{formatDateTime(schedule.next_run)}</PTag>
                        </PFlex>
                    </PFlexItem>
                )}
            </PFlex>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {status.total_active === 0 && status.total_queued === 0 && (
                    <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#fafafa', borderRadius: '4px', border: '1px dashed #ccc' }}>
                        <PText color="contrast-low">No active or queued jobs</PText>
                    </div>
                )}

                {/* Active Jobs */}
                {status.active.map((job) => (
                    <div key={job.job_id} style={{
                        padding: '16px',
                        border: '1px solid #C3E6CB',
                        backgroundColor: '#F3FCF5',
                        borderRadius: '4px'
                    }}>
                        <PFlex alignItems="center" justifyContent="space-between">
                            <PFlexItem>
                                <PFlex alignItems="center" style={{ gap: '12px' }}>
                                    <PTag color="notification-success">Active</PTag>
                                    <PText weight="semi-bold">{getCrawlerName(job.crawler_id)}</PText>
                                    <PText size="small" color="neutral-contrast-medium">
                                        Started: {job.started_at ? new Date(job.started_at).toLocaleTimeString() : 'Unknown'}
                                    </PText>
                                    <PText size="x-small" color="neutral-contrast-low">ID: {job.job_id}</PText>
                                </PFlex>
                            </PFlexItem>
                        </PFlex>
                    </div>
                ))}

                {/* Queued Jobs */}
                {sortedQueued.map((job, index) => (
                    <div key={job.job_id} style={{
                        padding: '16px',
                        border: '1px solid #e0e0e0',
                        backgroundColor: '#fafafa',
                        borderRadius: '4px'
                    }}>
                        <PFlex alignItems="center" justifyContent="space-between">
                            <PFlexItem>
                                <PFlex alignItems="center" style={{ gap: '12px' }}>
                                    <PTag color="notification-info-soft">Queued #{index + 1}</PTag>
                                    <PText weight="regular">{getCrawlerName(job.crawler_id)}</PText>
                                    <PText size="small" color="neutral-contrast-medium">
                                        Enqueued: {job.enqueued_at ? new Date(job.enqueued_at).toLocaleTimeString() : 'Unknown'}
                                    </PText>
                                    <PText size="x-small" color="neutral-contrast-low">ID: {job.job_id}</PText>
                                </PFlex>
                            </PFlexItem>
                        </PFlex>
                    </div>
                ))}
            </div>
        </div>
    );
};
