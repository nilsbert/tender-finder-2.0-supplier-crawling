import React, { useEffect, useState } from 'react';
import {
    PHeading,
    PText,
    PButton,
    PFlex,
    PInlineNotification,
    PDivider,
    PModal,
    PTextFieldWrapper
} from '../../pds-wrapper';
import { StandardPageHeader } from '../../components/StandardPageHeader';
import { adminApi, type RetentionConfig, type CleanupStats } from './api';

const RetentionConfigView: React.FC = () => {
    const [config, setConfig] = useState<RetentionConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [triggering, setTriggering] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');
    const [daysInput, setDaysInput] = useState<string>('30');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        setLoading(true);
        try {
            const data = await adminApi.getRetentionConfig();
            setConfig(data);
            setDaysInput(data.retention_days.toString());
        } catch (error) {
            console.error('Failed to load retention config:', error);
            setStatusType('error');
            setStatusMessage('Failed to load configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        const days = parseInt(daysInput, 10);
        if (isNaN(days) || days < 1) {
            setStatusType('error');
            setStatusMessage('Please enter a valid number of days (at least 1)');
            return;
        }

        setSaving(true);
        setStatusMessage('');
        try {
            const updated = await adminApi.updateRetentionConfig({ retention_days: days });
            setConfig(updated);
            setStatusType('success');
            setStatusMessage('Data retention policy updated successfully');
        } catch (error) {
            setStatusType('error');
            setStatusMessage('Failed to update configuration');
        } finally {
            setSaving(false);
        }
    };

    const handleTriggerCleanup = async () => {
        setIsConfirmModalOpen(true);
    };

    const confirmCleanup = async () => {
        setIsConfirmModalOpen(false);

        setTriggering(true);
        setStatusMessage('');
        try {
            const stats = await adminApi.triggerCleanup();
            setStatusType('success');
            setStatusMessage(`${stats.message} Deleted ${stats.deleted_count} tenders.`);
        } catch (error) {
            setStatusType('error');
            setStatusMessage('Failed to trigger cleanup job');
        } finally {
            setTriggering(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '24px' }}>
                <PText>Loading configuration...</PText>
            </div>
        );
    }

    return (
        <div className="p-content-wrapper">
            <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <StandardPageHeader
                    title="Data Retention Policy"
                    subtitle="Configure how long tenders and associated data should be kept in the system before being automatically deleted."
                />

                {statusMessage && (
                    <PInlineNotification
                        state={statusType}
                        heading={statusType === 'success' ? 'Success' : 'Error'}
                        description={statusMessage}
                        dismissButton={true}
                        onDismiss={() => setStatusMessage('')}
                    />
                )}

                <PFlex direction="column" style={{ gap: '16px', maxWidth: '400px' }}>
                    <PTextFieldWrapper
                        label="Retention Period (Days)"
                        description="Tenders older than this many days will be deleted nightly."
                    >
                        <input
                            type="number"
                            min={1}
                            value={daysInput}
                            onInput={(e: React.FormEvent<HTMLInputElement>) => setDaysInput((e.target as HTMLInputElement).value)}
                            style={{ fontSize: '14px', height: '42px', padding: '0 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
                        />
                    </PTextFieldWrapper>

                    <div>
                        <PButton
                            variant="primary"
                            onClick={handleSave}
                            loading={saving}
                            disabled={saving || triggering}
                        >
                            Save Policy
                        </PButton>
                    </div>
                </PFlex>

                <PDivider />

                <div>
                    <PHeading size="small">Manual Cleanup</PHeading>
                    <PText style={{ margin: '8px 0 16px 0' }}>
                        You can manually trigger the cleanup job. This will use the current retention period set above.
                    </PText>
                    <PButton
                        variant="secondary"
                        icon="delete"
                        onClick={handleTriggerCleanup}
                        loading={triggering}
                        disabled={saving || triggering}
                    >
                    </PButton>
                </div>
            </div>

            <PModal
                open={isConfirmModalOpen}
                onDismiss={() => setIsConfirmModalOpen(false)}
                heading="Confirm Manual Cleanup"
            >
                <PText>
                    Are you sure you want to trigger the cleanup job manually? This will delete old tenders and enrichment data permanently according to the current policy.
                </PText>
                <PFlex style={{ gap: '16px', marginTop: '24px' }} justifyContent="end">
                    <PButton variant="secondary" onClick={() => setIsConfirmModalOpen(false)}>
                        Cancel
                    </PButton>
                    <PButton variant="primary" onClick={confirmCleanup} loading={triggering}>
                        Run Cleanup
                    </PButton>
                </PFlex>
            </PModal>
        </div>
    );
};

export default RetentionConfigView;
