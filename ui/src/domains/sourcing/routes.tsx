import { Routes, Route, Navigate } from 'react-router-dom'

import { CrawlerConfigView } from './CrawlerConfigView'
import CrawlerRunView from './CrawlerRunView'
import { TenderDetailPage } from './TenderDetailPage'

interface SourcingRoutesProps {
    dbMode: 'disconnected' | 'cosmos'
}

export const SourcingRoutes = ({ dbMode }: SourcingRoutesProps) => (
    <Routes>
        <Route index element={<Navigate to="config/run" replace />} />

        {/* Legacy redirects */}
        <Route path="workbench" element={<Navigate to="/sourcing/config/run" replace />} />
        <Route path="analysis" element={<Navigate to="/sourcing/config/run" replace />} />
        
        <Route path="analysis/:id" element={<TenderDetailPage />} />
        <Route path="config/crawlers" element={<CrawlerConfigView />} />
        <Route path="config/run" element={<CrawlerRunView dbMode={dbMode} />} />
    </Routes>
)
