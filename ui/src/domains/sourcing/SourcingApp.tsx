import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, useLocation } from 'react-router-dom'
import { api } from './api'
import { ProcessHeader } from '../../components/ProcessHeader'
import { SourcingRoutes } from './routes'
import { StandardSubNavigation, StandardSubNavigationItem } from '../../components/StandardSubNavigation'

function SourcingApp() {
    const { t } = useTranslation()
    const [dbMode, setDbMode] = useState<'disconnected' | 'cosmos'>('disconnected')
    const [dbError, setDbError] = useState<string | null>(null)
    const location = useLocation()

    const checkDbStatus = async () => {
        try {
            console.log("[SourcingApp] Checking database status...");
            const status = await api.getConfigStatus()
            console.log("[SourcingApp] DB status response:", status);
            setDbMode(status.mode as 'disconnected' | 'cosmos')
            // @ts-ignore
            if (status.error) setDbError(status.error)
        } catch (e) {
            console.error("[SourcingApp] Failed to check db status, defaulting to disconnected", e)
            setDbMode('disconnected')
        }
    }

    useEffect(() => {
        checkDbStatus()
    }, [])

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <ProcessHeader
                activeItem="sourcing"
                dbMode={dbMode}
                dbError={dbError}
            />

            <StandardSubNavigation>
                <StandardSubNavigationItem
                    as={NavLink}
                    to="/sourcing/config/run"
                    label={t('header.run')}
                    active={location.pathname.includes('/sourcing/config/run') || location.pathname === '/sourcing' || location.pathname === '/sourcing/'}
                />
                <StandardSubNavigationItem
                    as={NavLink}
                    to="/sourcing/config/crawlers"
                    label={t('header.config')}
                    active={location.pathname.includes('/sourcing/config/crawlers')}
                />
            </StandardSubNavigation>

            {/* Render current route */}
            <SourcingRoutes dbMode={dbMode} />
        </div>
    )
}

export default SourcingApp
