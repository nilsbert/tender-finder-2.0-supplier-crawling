import React, { useState, useEffect } from 'react';
import {PButton,
    PFlex,
    PFlexItem,
    PHeading,
    PInlineNotification,
    PText,
    PTextFieldWrapper,
    PTag} from '@porsche-design-system/components-react';
import { api, type CrawlerConfig } from './api';

export const CrawlerConfigView: React.FC = () => {
    const [config, setConfig] = useState<CrawlerConfig | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState<{ status: 'success' | 'error', message: string } | null>(null);
    const [workerSize, setWorkerSize] = useState<number>(3);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const data = await api.getCrawlerConfig();
            setConfig(data);
            setWorkerSize(data.worker_size || 3);
        } catch (error) {
            console.error('Failed to load config', error);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaveStatus(null);

        if (workerSize < 1) {
            setSaveStatus({ status: 'error', message: 'Worker size must be at least 1' });
            return;
        }

        setIsLoading(true);
        try {
            if (config) {
                const updatedConfig = { ...config, worker_size: workerSize };
                await api.saveCrawlerConfig(updatedConfig);
                setConfig(updatedConfig);
                setSaveStatus({ status: 'success', message: 'Worker configuration saved and pool updated.' });
            }
        } catch (error) {
            console.error('Failed to save config', error);
            setSaveStatus({ status: 'error', message: 'Failed to update configuration.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRestartWorkers = async () => {
        if (!confirm("Are you sure you want to force kill and restart all workers? This will interrupt active jobs.")) {
            return;
        }

        setIsLoading(true);
        setSaveStatus(null);
        try {
            const result = await api.restartWorkers();
            setSaveStatus({ status: 'success', message: result.message || 'Workers restarted successfully.' });
        } catch (error) {
            console.error('Failed to restart workers', error);
            setSaveStatus({ status: 'error', message: 'Failed to restart workers.' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!config) return <PText>Loading configuration...</PText>;

    return (
        <div style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            maxWidth: '800px'
        }}>
            <PHeading size="medium" style={{ marginBottom: '16px' }}>Crawling Configuration</PHeading>

            {saveStatus && (
                <div style={{ marginBottom: '24px' }}>
                    <PInlineNotification
                        state={saveStatus.status}
                        heading={saveStatus.status === 'success' ? 'Success' : 'Error'}
                        description={saveStatus.message}
                        dismissButton={true}
                        onDismiss={() => setSaveStatus(null)}
                    />
                </div>
            )}

            <div style={{ marginBottom: '32px' }}>
                <PHeading size="small" style={{ marginBottom: '16px' }}>Worker Configuration</PHeading>
                <div style={{
                    padding: '16px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    border: '1px solid #e0e0e0',
                    marginBottom: '16px'
                }}>
                    <PText style={{ marginBottom: '8px' }}>
                        Manage background worker processes for crawling and enrichment jobs.
                        Increasing workers improves parallelism but consumes more system resources.
                    </PText>
                    <PFlex alignItems="center" style={{ gap: '8px' }}>
                        <PTag color="notification-info-soft">Current Active: {workerSize}</PTag>
                    </PFlex>
                </div>

                <form onSubmit={handleSave}>
                    <PFlex direction="column" style={{ gap: '16px' }}>
                        <PFlexItem>
                            <PTextFieldWrapper
                                label="Worker Size"
                                description="Number of concurrent processes (min: 1)"
                                state={workerSize < 1 ? 'error' : 'none'}
                                message={workerSize < 1 ? 'Must be at least 1' : ''}
                            >
                                <input
                                    type="number"
                                    min="1"
                                    value={workerSize}
                                    onChange={(e) => setWorkerSize(parseInt(e.target.value) || 0)}
                                    required
                                />
                            </PTextFieldWrapper>
                        </PFlexItem>

                        <PFlex style={{ gap: '16px' }}>
                            <PButton type="submit" loading={isLoading} disabled={isLoading || workerSize < 1}>
                                Save & Resize Pool
                            </PButton>
                            <PButton
                                type="button"
                                variant="secondary"
                                loading={isLoading}
                                icon="delete"
                                onClick={handleRestartWorkers}
                            >
                                Kill & Restart Workers
                            </PButton>
                        </PFlex>
                    </PFlex>
                </form>
            </div>

        </div>
    );
};
