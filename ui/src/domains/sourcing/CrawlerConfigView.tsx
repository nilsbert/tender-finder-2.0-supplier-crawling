import React, { useState, useEffect } from 'react';
import {PButton, PHeading, PInlineNotification, PText, PTextFieldWrapper, PTag} from '@porsche-design-system/components-react';
// import { StandardPageHeader } from '../../components/StandardPageHeader'; // Removed
import { api, type CrawlerConfig } from './api';
import ManualUploadConfigView from './manual_upload/ManualUploadConfigView';

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
        if (isLoading) return;

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
        <div style={{ maxWidth: '1760px', margin: '0 auto', padding: '0 24px' }}>
            <div style={{ padding: '32px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <PHeading size="large">Crawling Configuration</PHeading>
                        <PText color="contrast-medium" style={{ marginTop: '8px' }}>
                            Manage background worker processes, crawler settings, and manual upload AI prompt.
                        </PText>
                    </div>
                </div>

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

                <div style={{ display: 'grid', gap: '24px' }}>
                    {/* Worker Configuration Card */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '32px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        border: '1px solid #e0e0e0'
                    }}>
                        <PHeading size="medium" style={{ marginBottom: '8px' }}>Worker Configuration</PHeading>
                        <PText color="contrast-medium" style={{ marginBottom: '24px', maxWidth: '700px' }}>
                            Manage background worker processes for crawling and enrichment jobs.
                            Increasing workers improves parallelism but consumes more system resources.
                        </PText>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '32px',
                            padding: '12px 16px',
                            background: '#f8f9fa',
                            borderRadius: '8px',
                            width: 'fit-content'
                        }}>
                            <PText weight="semi-bold">Current Active Workers:</PText>
                            <PTag color="notification-info-soft">{workerSize}</PTag>
                        </div>

                        <form onSubmit={handleSave}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '400px' }}>
                                <PTextFieldWrapper
                                    label="Worker Pool Size"
                                    description="Target number of concurrent processes (min: 1)"
                                    state={workerSize < 1 ? 'error' : 'none'}
                                    message={workerSize < 1 ? 'Must be at least 1' : ''}
                                >
                                    <input
                                        type="number"
                                        min="1"
                                        value={workerSize}
                                        onChange={(e) => setWorkerSize(parseInt(e.target.value) || 0)}
                                        required
                                        style={{ fontSize: '16px' }}
                                    />
                                </PTextFieldWrapper>

                                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
                                    <PButton type="submit" loading={isLoading} disabled={isLoading || workerSize < 1}>
                                        Save & Resize Pool
                                    </PButton>
                                    <PButton
                                        type="button"
                                        variant="secondary"
                                        loading={isLoading}
                                        icon="delete"
                                        onClick={handleRestartWorkers}
                                        disabled={isLoading}
                                    >
                                        Force Restart
                                    </PButton>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Manual Upload Config Section */}
                    <ManualUploadConfigView />
                </div>
            </div>
        </div>
    );
};
