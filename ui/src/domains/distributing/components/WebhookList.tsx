import React, { useEffect, useState } from 'react';
import {PButton,
    PTable,
    PTableHead,
    PTableBody,
    PTableRow,
    PTableHeadCell,
    PTableCell,
    PText,
    PTag,
    PInlineNotification,
    PModal} from '@porsche-design-system/components-react';
import { distributingApi, Webhook } from '../api/distributingApi';

interface Props {
    onEdit: (webhook: Webhook) => void;
    refreshTrigger: number; // Prop to trigger refresh
}

export const WebhookList: React.FC<Props> = ({ onEdit, refreshTrigger }) => {
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWebhooks = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await distributingApi.getWebhooks();
            setWebhooks(data);
        } catch (e) {
            setError("Failed to load webhooks");
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWebhooks();
    }, [refreshTrigger]);

    const [testResult, setTestResult] = useState<{ id: string, success: boolean } | null>(null);

    const handleTest = async (id: string, url: string) => {
        setTestResult(null);
        try {
            await distributingApi.testConnection(url);
            setTestResult({ id, success: true });
            setTimeout(() => setTestResult(null), 3000);
        } catch (e) {
            setTestResult({ id, success: false });
            setTimeout(() => setTestResult(null), 3000);
        }
    };

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedWebhookId, setSelectedWebhookId] = useState<string | null>(null);

    const confirmDelete = (id: string) => {
        setSelectedWebhookId(id);
        setDeleteModalOpen(true);
    };

    const executeDelete = async () => {
        if (!selectedWebhookId) return;

        try {
            await distributingApi.deleteWebhook(selectedWebhookId);
            fetchWebhooks();
        } catch (e) {
            console.error(e);
            alert("Failed to delete webhook");
        } finally {
            setDeleteModalOpen(false);
            setSelectedWebhookId(null);
        }
    };

    const sortedWebhooks = [...webhooks].sort((a, b) => {
        // 1. Sort by Type Priority: ALL < SECTOR < SERVICE
        const typePriority = { 'ALL': 0, 'SECTOR': 1, 'SERVICE': 2 };
        const pA = typePriority[a.scope_type as keyof typeof typePriority] ?? 99;
        const pB = typePriority[b.scope_type as keyof typeof typePriority] ?? 99;
        if (pA !== pB) return pA - pB;

        // 2. Sort by Scope Value (Name of Sector/Service)
        if (a.scope_value && b.scope_value) {
            return a.scope_value.localeCompare(b.scope_value);
        }

        // 3. Fallback to Name
        return a.name.localeCompare(b.name);
    });

    if (loading && webhooks.length === 0) return <PText>Loading...</PText>;

    return (
        <div className="space-y-4 mt-6">
            <style>{`
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 48px;
                    height: 24px;
                }
                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #d5001c;
                    transition: .3s;
                    border-radius: 24px;
                }
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 18px;
                    width: 18px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: .3s;
                    border-radius: 50%;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                input:checked + .slider {
                    background-color: #1b7e28;
                }
                input:checked + .slider:before {
                    transform: translateX(24px);
                }
                input:focus + .slider {
                    box-shadow: 0 0 1px #1b7e28;
                }
            `}</style>

            {error && <PInlineNotification state="error" heading="Error" description={error} />}

            {webhooks.length === 0 && !loading ? (
                <PText>No webhooks configured.</PText>
            ) : (
                <PTable caption="Configured Distribution Webhooks">
                    <PTableHead>
                        <PTableRow>
                            <PTableHeadCell>Name</PTableHeadCell>
                            <PTableHeadCell>Enabled</PTableHeadCell>
                            <PTableHeadCell>Scope</PTableHeadCell>
                            <PTableHeadCell>Scope Name</PTableHeadCell>
                            <PTableHeadCell>URL</PTableHeadCell>
                            <PTableHeadCell>Actions</PTableHeadCell>
                        </PTableRow>
                    </PTableHead>
                    <PTableBody>
                        {sortedWebhooks.map((wh) => (
                            <PTableRow key={wh.id}>
                                <PTableCell>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span>{wh.name}</span>
                                        {wh.failure_count > 0 && (
                                            <span style={{ fontSize: '12px', color: '#f0ad4e' }}>⚠️ {wh.failure_count} issues</span>
                                        )}
                                    </div>
                                </PTableCell>
                                <PTableCell>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={wh.is_active}
                                            onChange={async () => {
                                                try {
                                                    // Optimistic update could be done here, but we wait for refresh
                                                    await distributingApi.updateWebhook(wh.id, { is_active: !wh.is_active });
                                                    fetchWebhooks();
                                                } catch (e) {
                                                    console.error("Failed to toggle status", e);
                                                    alert("Failed to update status");
                                                }
                                            }}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </PTableCell>
                                <PTableCell>
                                    <PTag color={wh.scope_type === 'ALL' ? 'primary' : 'notification-info-soft'}>{wh.scope_type}</PTag>
                                </PTableCell>
                                <PTableCell>
                                    {wh.scope_value && wh.scope_type !== 'ALL' ? (
                                        <span style={{ fontSize: '14px', color: '#333' }}>
                                            {wh.scope_value}
                                        </span>
                                    ) : (
                                        <span style={{ fontSize: '14px', color: '#999', fontStyle: 'italic' }}>-</span>
                                    )}
                                </PTableCell>
                                <div style={{ display: 'none' }}></div>
                                <PTableCell>
                                    <span
                                        style={{
                                            display: 'block',
                                            maxWidth: '200px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            color: '#666',
                                            fontSize: '12px',
                                            fontFamily: 'monospace'
                                        }}
                                        title={wh.webhook_url}
                                    >
                                        {wh.webhook_url.replace(/^https?:\/\//, '')}
                                    </span>
                                </PTableCell>
                                <PTableCell>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <PButton variant="secondary" compact={true} icon="arrow-head-right" onClick={() => handleTest(wh.id, wh.webhook_url)}>Check</PButton>
                                        {testResult?.id === wh.id && (
                                            <span style={{ fontSize: '18px', lineHeight: '32px' }}>
                                                {testResult.success ? '✅' : '❌'}
                                            </span>
                                        )}
                                        <PButton variant="ghost" compact={true} icon="edit" onClick={() => onEdit(wh)}>Edit</PButton>
                                        <PButton variant="ghost" compact={true} icon="delete" onClick={() => confirmDelete(wh.id)}>Delete</PButton>
                                    </div>
                                </PTableCell>
                            </PTableRow>
                        ))}
                    </PTableBody>
                </PTable>
            )}

            <PModal
                open={deleteModalOpen}
                onDismiss={() => setDeleteModalOpen(false)}
                aria={{ 'aria-label': 'Delete Webhook Modal' }}
            >
                <PHeading size="large" slot="header">Delete Webhook</PHeading>
                <div style={{ padding: '0 0 24px 0' }}>
                    <PText>Are you sure you want to delete this webhook?</PText>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '24px', justifyContent: 'flex-end' }}>
                        <PButton variant="ghost" onClick={() => setDeleteModalOpen(false)}>Cancel</PButton>
                        <PButton variant="primary" onClick={executeDelete}>Delete</PButton>
                    </div>
                </div>
            </PModal>
        </div>
    );
};
