import { useState, useEffect } from 'react'

import { ProcessHeader } from '../../components/ProcessHeader'
import ReferenceLibraryView from './ReferenceLibraryView'
import ProfileLibraryView from './ProfileLibraryView'
import { api } from '../sourcing/api'
import { StandardSubNavigation, StandardSubNavigationItem } from '../../components/StandardSubNavigation'
import { StandardPageHeader } from '../../components/StandardPageHeader'

const ReferenceProfileApp: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'references' | 'profiles'>('references')
    const [dbMode, setDbMode] = useState<'disconnected' | 'cosmos'>('disconnected')

    useEffect(() => {
        // Simple hash-based routing for sub-tabs
        const handleHashChange = () => {
            const hash = window.location.hash
            if (hash.includes('profiles')) {
                setActiveTab('profiles')
            } else {
                setActiveTab('references')
            }
        }

        handleHashChange()
        window.addEventListener('hashchange', handleHashChange)
        return () => window.removeEventListener('hashchange', handleHashChange)
    }, [])

    useEffect(() => {
        api.getConfigStatus().then(status => {
            setDbMode(status.mode as 'disconnected' | 'cosmos')
        })
    }, [])

    const handleTabChange = (tab: 'references' | 'profiles') => {
        setActiveTab(tab)
        window.location.hash = tab === 'profiles' ? '#references/profiles' : '#references/library'
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <ProcessHeader activeItem="references" dbMode={dbMode} />

            <StandardSubNavigation>
                <StandardSubNavigationItem
                    label="References"
                    active={activeTab === 'references'}
                    onClick={() => handleTabChange('references')}
                />
                <StandardSubNavigationItem
                    label="Profiles"
                    active={activeTab === 'profiles'}
                    onClick={() => handleTabChange('profiles')}
                />
            </StandardSubNavigation>

            <div style={{ marginTop: '24px' }}>
                {activeTab === 'references' ? (
                    <div className="p-content-wrapper">
                        <div style={{ padding: '0 24px' }}>
                            <StandardPageHeader
                                title="Reference Library"
                                subtitle="Manage and view all tender references."
                            />
                            <ReferenceLibraryView />
                        </div>
                    </div>
                ) : (
                    <div className="p-content-wrapper">
                        <div style={{ padding: '0 24px' }}>
                            <StandardPageHeader
                                title="Profile Library"
                                subtitle="Manage user profiles and roles."
                            />
                            <ProfileLibraryView />
                        </div>
                    </div>
                )}
            </div>
        </div >
    )
}

export default ReferenceProfileApp
