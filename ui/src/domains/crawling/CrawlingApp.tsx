import { useState, useEffect } from 'react'
import {PText} from '@porsche-design-system/components-react'
import { api } from './api'
import CrawlerRunView from './CrawlerRunView'
import CrawlingAnalysisView from './CrawlingAnalysisView'
import { ProcessHeader } from '../../components/ProcessHeader'

function CrawlingApp() {
    const [dbMode, setDbMode] = useState<'disconnected' | 'cosmos'>('disconnected')
    const [currentView, setCurrentView] = useState<'crawler' | 'analysis'>('crawler')

    const checkDbStatus = async () => {
        try {
            const status = await api.getConfigStatus()
            setDbMode(status.mode as 'disconnected' | 'cosmos')
        } catch (e) {
            console.error("Failed to check db status", e)
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
                showSourcingAutomation
            />

            {/* Sub-Section Navigation (Crawling Domain) */}
            <div style={{
                backgroundColor: '#fafafa',
                borderBottom: '1px solid #e0e0e0'
            }}>
                <div className="p-content-wrapper">
                    <div style={{
                        padding: '0 24px',
                        display: 'flex',
                        gap: '24px'
                    }}>
                        <button
                            onClick={() => setCurrentView('crawler')}
                            style={{
                                padding: '16px 0',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                color: currentView === 'crawler' ? '#111' : '#666',
                                borderBottom: currentView === 'crawler' ? '2px solid #111' : '2px solid transparent',
                                fontWeight: currentView === 'crawler' ? 'bold' : 'normal',
                                fontSize: '14px',
                                transition: 'all 0.2s'
                            }}
                        >
                            Crawling
                        </button>
                        <button
                            style={{
                                padding: '16px 0',
                                border: 'none',
                                background: 'none',
                                cursor: 'not-allowed',
                                color: '#ccc',
                                borderBottom: '2px solid transparent',
                                fontWeight: 'normal',
                                fontSize: '14px',
                                transition: 'all 0.2s',
                                pointerEvents: 'none'
                            }}
                            title="Coming soon"
                            disabled
                        >
                            Crawler Analysis 🚧
                        </button>
                        <button
                            style={{
                                padding: '16px 0',
                                border: 'none',
                                background: 'none',
                                cursor: 'not-allowed',
                                color: '#ccc',
                                borderBottom: '2px solid transparent',
                                fontWeight: 'normal',
                                fontSize: '14px',
                                transition: 'all 0.2s',
                                pointerEvents: 'none'
                            }}
                            title="Coming soon"
                            disabled
                        >
                            Manual Upload 🚧
                        </button>
                    </div>
                </div>
            </div>
            {/* Render current view */}
            {currentView === 'crawler' ? <CrawlerRunView dbMode={dbMode} /> : <CrawlingAnalysisView />}
        </div>
    )
}

export default CrawlingApp
