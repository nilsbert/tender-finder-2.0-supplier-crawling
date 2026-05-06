import React from 'react';
import { Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import EnrichingConfigView from '../enriching/EnrichingConfig';
import AIConfigOverview from './AIConfigOverview';
import { NotFound } from '../../routing/NotFound';
import { ProcessHeader } from '../../components/ProcessHeader';
import { StandardSubNavigation, StandardSubNavigationItem } from '../../components/StandardSubNavigation';

import RetentionConfigView from '../admin/RetentionConfig';
import ContractInfoOverview from '../admin/ContractInfoOverview';
import { RatingPolicyConfigView } from '../admin/RatingPolicyConfig';

const ConfigApp = () => {
    const location = useLocation();

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <ProcessHeader activeItem="settings" />

            <StandardSubNavigation>
                <StandardSubNavigationItem
                    as={NavLink}
                    to="/config/ai"
                    label="AI Provider"
                    active={location.pathname === '/config/ai'}
                />
                <StandardSubNavigationItem
                    as={NavLink}
                    to="/config/contract-info"
                    label="Contract Info"
                    active={location.pathname === '/config/contract-info'}
                />
                <StandardSubNavigationItem
                    as={NavLink}
                    to="/config/prompts"
                    label="Enrichment Prompts"
                    active={location.pathname === '/config/prompts'}
                />
                <StandardSubNavigationItem
                    as={NavLink}
                    to="/config/rating"
                    label="Rating Policy"
                    active={location.pathname === '/config/rating'}
                />
                <StandardSubNavigationItem
                    as={NavLink}
                    to="/config/retention"
                    label="Data Retention"
                    active={location.pathname === '/config/retention'}
                />
            </StandardSubNavigation>

            <Routes>
                <Route path="/" element={<Navigate to="ai" replace />} />
                <Route path="ai" element={<AIConfigOverview />} />
                <Route path="contract-info" element={<ContractInfoOverview />} />
                <Route path="prompts" element={<EnrichingConfigView />} />
                <Route path="rating" element={<RatingPolicyConfigView />} />
                <Route path="retention" element={<RetentionConfigView />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
    );
};

export default ConfigApp;
