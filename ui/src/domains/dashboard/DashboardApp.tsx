import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardView from './DashboardView'
import { ProcessHeader } from '../../components/ProcessHeader';

export function DashboardApp() {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <ProcessHeader activeItem="dashboard" />
            <Routes>
                <Route index element={<DashboardView />} />
                <Route path="*" element={<Navigate to="" replace />} />
            </Routes>
        </div>
    )
}
