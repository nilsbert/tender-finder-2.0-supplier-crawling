import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, useLocation } from 'react-router-dom'
import { api } from './api'
import AdminHeader from '../../components/AdminHeader';
import { SourcingRoutes } from './routes'
import { StandardSubNavigation, StandardSubNavigationItem } from '../../components/StandardSubNavigation'

function SourcingApp() {
    const { t } = useTranslation()
    const [dbMode, setDbMode] = useState<'disconnected' | 'cosmos'>('disconnected')
    const [dbError, setDbError] = useState<string | null>(null)
    const location = useLocation()

    const checkDbStatus = async () => {
        try {
            const status = await api.getConfigStatus()
            setDbMode(status.mode as 'disconnected' | 'cosmos')
            // @ts-ignore
            if (status.error) setDbError(status.error)
        } catch (e) {
            setDbMode('disconnected')
        }
    }

    useEffect(() => {
        checkDbStatus()
    }, [])

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'transparent' }}>
            <AdminHeader />

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

            <div className="p-content-wrapper" style={{ padding: '40px' }}>
                <SourcingRoutes dbMode={dbMode} />
            </div>
        </div>
    )
}

export default SourcingApp
