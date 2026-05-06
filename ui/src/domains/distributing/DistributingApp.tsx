import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {PHeading, PButton} from '@porsche-design-system/components-react';
import { WebhookList } from './components/WebhookList';
import { WebhookForm } from './components/WebhookForm';

import { DistributionOfficeList } from './components/DistributionOfficeList';
import { DistributionOfficeForm } from './components/DistributionOfficeForm';
import { DistributionLogList } from './components/DistributionLogList';
import { Webhook, DistributionOffice, distributingApi } from './api/distributingApi';
import { ProcessHeader } from '../../components/ProcessHeader';
import { StandardSubNavigation, StandardSubNavigationItem } from '../../components/StandardSubNavigation';
import { StandardPageHeader } from '../../components/StandardPageHeader';

const WebhooksView = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleEdit = (wh: Webhook) => {
        setEditingWebhook(wh);
        setIsEditing(true);
    };

    const handleCreate = () => {
        setEditingWebhook(null);
        setIsEditing(true);
    };

    const handleSuccess = () => {
        setIsEditing(false);
        setEditingWebhook(null);
        setRefreshTrigger(prev => prev + 1);
    };

    // Use StandardPageHeader for consistency if not editing
    if (isEditing) {
        return (
            <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '24px' }}>
                <PHeading size="large" style={{ marginBottom: '24px' }}>
                    {editingWebhook ? 'Edit Webhook' : 'Create Webhook'}
                </PHeading>
                <WebhookForm
                    initialData={editingWebhook}
                    onSuccess={handleSuccess}
                    onCancel={() => setIsEditing(false)}
                />
            </div>
        )
    }

    return (
        <div className="p-content-wrapper">
            <div style={{ padding: '32px 24px' }}>
                <StandardPageHeader
                    title="App Webhooks Management"
                    subtitle="Manage MS Teams webhooks for tender distribution."
                >
                    <div style={{ marginTop: '24px' }}>
                        <PButton
                            variant="primary"
                            onClick={handleCreate}
                            icon="plus"
                        >
                            Add Webhook
                        </PButton>
                    </div>
                </StandardPageHeader>

                <div style={{ marginTop: '24px' }}>
                    <WebhookList onEdit={handleEdit} refreshTrigger={refreshTrigger} />
                </div>
            </div>
        </div>
    );
};

const OfficesView = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [editingOffice, setEditingOffice] = useState<DistributionOffice | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleEdit = (office: DistributionOffice) => {
        setEditingOffice(office);
        setIsEditing(true);
    };

    const handleCreate = () => {
        setEditingOffice(null);
        setIsEditing(true);
    };

    const handleSuccess = () => {
        setIsEditing(false);
        setEditingOffice(null);
        setRefreshTrigger(prev => prev + 1);
    };

    if (isEditing) {
        return (
            <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '24px' }}>
                <PHeading size="large" style={{ marginBottom: '24px' }}>
                    {editingOffice ? 'Edit Office' : 'Create Office'}
                </PHeading>
                <DistributionOfficeForm
                    initialData={editingOffice}
                    onSuccess={handleSuccess}
                    onCancel={() => setIsEditing(false)}
                />
            </div>
        )
    }

    return (
        <div className="p-content-wrapper">
            <div style={{ padding: '32px 24px' }}>
                <StandardPageHeader
                    title="Office Management"
                    subtitle="Manage physical locations for distribution."
                >
                    <div style={{ marginTop: '24px' }}>
                        <PButton
                            variant="primary"
                            onClick={handleCreate}
                            icon="plus"
                        >
                            Add Office
                        </PButton>
                    </div>
                </StandardPageHeader>

                <div style={{ marginTop: '24px' }}>
                    <DistributionOfficeList onEdit={handleEdit} refreshTrigger={refreshTrigger} />
                </div>
            </div>
        </div>
    );
};

const LogsView = () => (
    <div className="p-content-wrapper">
        <div style={{ padding: '32px 24px' }}>
            <StandardPageHeader
                title="Distribution Logs"
                subtitle="View history of sent one-pagers."
            />
            <div style={{ marginTop: '24px' }}>
                <DistributionLogList />
            </div>
        </div>
    </div>
);

export const DistributingApp = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [dbMode, setDbMode] = useState<'disconnected' | 'cosmos'>('disconnected');
    const [dbError, setDbError] = useState<string | null>(null);

    // Fetch DB Status
    const checkDbStatus = async () => {
        try {
            const status = await distributingApi.getConfigStatus();
            setDbMode(status.mode as 'disconnected' | 'cosmos');
            if (status.error) setDbError(status.error);
        } catch (e) {
            console.error("Failed to check db status", e);
        }
    };

    useEffect(() => {
        checkDbStatus();
    }, []);

    const isWebhooks = location.pathname.includes('/webhooks') || location.pathname === '/distributing';
    const isLogs = location.pathname.includes('/logs');

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <ProcessHeader
                activeItem="distributing"
                dbMode={dbMode}
                dbError={dbError}
            />

            <StandardSubNavigation>
                <StandardSubNavigationItem
                    label="Webhooks"
                    active={isWebhooks}
                    onClick={() => navigate('/distributing/webhooks')}
                />
                <StandardSubNavigationItem
                    label="Distribution Logs"
                    active={isLogs}
                    onClick={() => navigate('/distributing/logs')}
                />
            </StandardSubNavigation>

            <Routes>
                <Route path="webhooks" element={<WebhooksView />} />
                <Route path="logs" element={<LogsView />} />
                <Route path="/" element={<Navigate to="webhooks" replace />} />
                <Route path="*" element={<Navigate to="webhooks" replace />} />
            </Routes>
        </div>
    );
};
export default DistributingApp;
