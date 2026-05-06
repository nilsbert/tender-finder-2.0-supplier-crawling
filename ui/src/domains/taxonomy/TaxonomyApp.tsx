import { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import {PHeading, PButton} from '@porsche-design-system/components-react';
import { ProcessHeader } from '../../components/ProcessHeader';
import { StandardPageHeader } from '../../components/StandardPageHeader';
import { StandardSubNavigation, StandardSubNavigationItem } from '../../components/StandardSubNavigation';

import { Label as LabelType } from './taxonomyApi';
import { LabelList as LabelListComponent } from './components/LabelList';
import { LabelForm as LabelFormComponent } from './components/LabelForm';
import { DistributionOffice } from '../distributing/api/distributingApi';
import { DistributionOfficeList } from '../distributing/components/DistributionOfficeList';
import { DistributionOfficeForm } from '../distributing/components/DistributionOfficeForm';

const LabelsView = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [editingLabel, setEditingLabel] = useState<LabelType | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleEdit = (label: LabelType) => {
        setEditingLabel(label);
        setIsEditing(true);
    };

    const handleCreate = () => {
        setEditingLabel(null);
        setIsEditing(true);
    };

    const handleSuccess = () => {
        setIsEditing(false);
        setEditingLabel(null);
        setRefreshTrigger(prev => prev + 1);
    };

    if (isEditing) {
        return (
            <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '24px' }}>
                <PHeading size="large" style={{ marginBottom: '24px' }}>
                    {editingLabel ? 'Edit Label' : 'Create Label'}
                </PHeading>
                <LabelFormComponent
                    initialData={editingLabel}
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
                    title="Label Management"
                    subtitle="Define Sectors, Services, and Custom labels for AI-based distribution."
                >
                    <div style={{ marginTop: '24px' }}>
                        <PButton
                            variant="primary"
                            onClick={handleCreate}
                            icon="plus"
                        >
                            Add Label
                        </PButton>
                    </div>
                </StandardPageHeader>

                <div style={{ marginTop: '24px' }}>
                    <LabelListComponent onEdit={handleEdit} refreshTrigger={refreshTrigger} />
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
                    subtitle="Manage physical locations for distribution and matching."
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

const LogsView = () => {
    return (
        <div className="p-content-wrapper">
            <div style={{ padding: '32px 24px' }}>
                <StandardPageHeader
                    title="Taxonomy Logs"
                    subtitle="View audit trail of taxonomy changes."
                >
                </StandardPageHeader>

                <div style={{ marginTop: '24px', padding: '24px', backgroundColor: 'white', borderRadius: '8px' }}>
                    <PHeading size="medium">Coming Soon</PHeading>
                    <p style={{ marginTop: '16px', color: '#666' }}>
                        Logs for label and office changes will be available here.
                    </p>
                </div>
            </div>
        </div>
    );
};

export const TaxonomyApp = () => {
    const location = useLocation();

    const isLabels = location.pathname === '/taxonomy/labels' || location.pathname === '/taxonomy';
    const isOffices = location.pathname === '/taxonomy/offices';
    const isLogs = location.pathname === '/taxonomy/logs';

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <ProcessHeader activeItem="taxonomy" />

            <StandardSubNavigation>
                <StandardSubNavigationItem
                    label="Labels"
                    active={isLabels}
                    onClick={() => window.location.href = '/taxonomy/labels'}
                />
                <StandardSubNavigationItem
                    label="Offices"
                    active={isOffices}
                    onClick={() => window.location.href = '/taxonomy/offices'}
                />
                <StandardSubNavigationItem
                    label="Logs"
                    active={isLogs}
                    onClick={() => window.location.href = '/taxonomy/logs'}
                />
            </StandardSubNavigation>

            <Routes>
                <Route path="labels" element={<LabelsView />} />
                <Route path="offices" element={<OfficesView />} />
                <Route path="logs" element={<LogsView />} />
                <Route path="/" element={<Navigate to="labels" replace />} />
                <Route path="*" element={<Navigate to="labels" replace />} />
            </Routes>
        </div>
    );
};

export default TaxonomyApp;
