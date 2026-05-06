import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react';
import { StandardSubNavigation, StandardSubNavigationItem } from '../../components/StandardSubNavigation';

import EnrichingConfigView from '../enriching/EnrichingConfig'
import { EnrichmentDashboard } from '../enriching/EnrichmentDashboard';
import { NotFound } from '../../routing/NotFound'
import { ProcessHeader } from '../../components/ProcessHeader';
import { api as ratingApi } from '../rating/api';

const EnrichingApp = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [dbMode, setDbMode] = useState<'disconnected' | 'cosmos' | 'test' | 'mssql'>('disconnected');
    const [dbError, setDbError] = useState<string | null>(null);

    useEffect(() => {
        const checkDbStatus = async () => {
            try {
                const status = await ratingApi.getConfigStatus();
                setDbMode(status.mode as 'disconnected' | 'cosmos' | 'test' | 'mssql');
                // @ts-ignore
                if (status.error) setDbError(status.error);
            } catch (e) {
                console.error("Failed to check db status", e);
            }
        };
        checkDbStatus();
    }, []);

    // Determine active item based on path
    const activeItem = location.pathname.includes('/config') ? 'config' : 'capability';
    const isDashboard = location.pathname.includes('/dashboard');

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <ProcessHeader activeItem={activeItem} dbMode={dbMode} dbError={dbError} />

            <StandardSubNavigation>
                <StandardSubNavigationItem
                    label="Config"
                    active={!isDashboard}
                    onClick={() => navigate('/enrichment/console')}
                />
                <StandardSubNavigationItem
                    label="Worker Dashboard"
                    active={isDashboard}
                    onClick={() => navigate('/enrichment/dashboard')}
                />
            </StandardSubNavigation>

            <Routes>
                <Route path="/" element={<Navigate to="console" replace />} />
                <Route path="console" element={<EnrichingConfigView />} />
                <Route path="config" element={<EnrichingConfigView />} />
                <Route path="dashboard" element={<EnrichmentDashboard />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
    )
}

export default EnrichingApp
