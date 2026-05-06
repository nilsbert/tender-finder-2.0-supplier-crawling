import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {PButton,
    PHeading,
    PText,
    PIcon,
    PDivider,
    PModal,
    PButtonGroup,
    PTag,
    PLink} from '@porsche-design-system/components-react'
import { api, type CrawlerConfig } from './api'
import { CrawlerQueueList } from './CrawlerQueueList'
import { featureFlags } from '../../config/featureFlags'

interface CrawlerRunViewProps {
    dbMode: 'disconnected' | 'cosmos'
}

interface CrawlerInfo {
    id: string
    name: string
    description: string
    configKey: keyof CrawlerConfig
    type: 'portal' | 'company'
}

const crawlers: CrawlerInfo[] = [
    // ... existing portals ...
    {
        id: 'ted_austria',
        name: 'TED Austria',
        description: 'Official EU tenders publication database, filtered for Austria. Specifically targets AT country code.',
        configKey: 'scrape_ted_austria',
        type: 'portal'
    },
    {
        id: 'ted_switzerland',
        name: 'TED Switzerland',
        description: 'Official EU tenders publication database, filtered for Switzerland. Targets Swiss notices published on TED.',
        configKey: 'scrape_ted_switzerland',
        type: 'portal'
    },
    {
        id: 'ted_germany',
        name: 'TED Germany',
        description: 'Official EU tenders publication database, filtered for Germany. Targets German notices published on TED.',
        configKey: 'scrape_ted_germany',
        type: 'portal'
    },
    {
        id: 'evergabe',
        name: 'Evergabe Online',
        description: 'German federal procurement platform. Access to nationwide public tenders and contract notices.',
        configKey: 'scrape_evergabe_online',
        type: 'portal'
    },
    {
        id: 'oeffentliche',
        name: 'Öffentliche Vergabe',
        description: 'Comprehensive German tender portal covering federal, state, and municipal procurement.',
        configKey: 'scrape_oeffentliche_vergabe',
        type: 'portal'
    },
    {
        id: 'simap',
        name: 'SIMAP',
        description: 'Swiss public procurement platform. Official tender publication system for Switzerland.',
        configKey: 'scrape_simap',
        type: 'portal'
    },
    {
        id: 'austria',
        name: 'Austria (Bund)',
        description: 'Austrian federal procurement portal. Official tender notices from Austrian government agencies.',
        configKey: 'scrape_austria',
        type: 'portal'
    },
    {
        id: 'tender24',
        name: 'Tender24',
        description: 'Commercial tender aggregation platform covering multiple European procurement databases.',
        configKey: 'scrape_tender24',
        type: 'portal'
    },
    {
        id: 'bund',
        name: 'Bund.de',
        description: 'German federal government procurement portal. Official tenders from federal ministries and agencies.',
        configKey: 'scrape_bund',
        type: 'portal'
    },
    {
        id: 'ad',
        name: 'Ausschreibungen Deutschland',
        description: 'Comprehensive database for German public tenders and contract notices across all sectors.',
        configKey: 'scrape_ad',
        type: 'portal'
    },

    // --- Companies ---
    {
        id: 'tk',
        name: 'Techniker Krankenkasse',
        description: 'Direct crawler for TK procurement portal (vergabe.tk.de).',
        configKey: 'scrape_tk',
        type: 'company'
    },
    {
        id: 'db',
        name: 'Deutsche Bahn',
        description: 'Direct crawler for DB Supplier Portal.',
        configKey: 'scrape_db',
        type: 'company'
    }
] as CrawlerInfo[];

const filteredCrawlers = crawlers.filter(crawler => {
    if (crawler.id === 'tk' && featureFlags.hideTkCrawler) return false;
    if (crawler.id === 'db' && featureFlags.hideDbCrawler) return false;
    return true;
});

/**
 * View for managing and running tender crawlers.
 * 
 * Provides a list of all available crawlers (regional TED, Bund, etc.),
 * allows starting them individually or in batch, and monitors their
 * real-time progress. Supports setting run limits for each crawler.
 * 
 * @param props - Component properties including database connection mode.
 */
function CrawlerRunView({ dbMode }: CrawlerRunViewProps) {
    const { t } = useTranslation()
    const [config, setConfig] = useState<CrawlerConfig | null>(null)
    const [loading, setLoading] = useState(true)
    const [runningCrawlers, setRunningCrawlers] = useState<Set<string>>(new Set())
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [crawlerStatus, setCrawlerStatus] = useState<Record<string, any>>({})
    const [crawlerLimits, setCrawlerLimits] = useState<Record<string, { stopAtDate?: string, maxTenders?: number }>>({})
    const [expandedLimits, setExpandedLimits] = useState<Set<string>>(new Set())



    useEffect(() => {
        loadConfig()
    }, [])

    // Poll for status
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let intervalId: any

        if (runningCrawlers.size > 0) {
            intervalId = setInterval(async () => {
                try {
                    // Poll all running crawlers
                    runningCrawlers.forEach(async (crawlerId) => {
                        try {
                            const status = await api.getCrawlerStatus(crawlerId)
                            setCrawlerStatus(prev => ({ ...prev, [crawlerId]: status }))

                            if (status.status === 'completed' || status.status === 'failed') {
                                setRunningCrawlers(prev => {
                                    const next = new Set(prev)
                                    next.delete(crawlerId)
                                    return next
                                })
                            }
                        } catch (e) {
                            console.error(`Polling error for ${crawlerId}`, e)
                        }
                    })
                } catch (e) {
                    console.error("Polling loop error", e)
                }
            }, 2000)
        }

        return () => {
            if (intervalId) clearInterval(intervalId)
        }
    }, [runningCrawlers])

    const loadConfig = async () => {
        try {
            const data = await api.getCrawlerConfig()
            setConfig(data)

            // Initialize default limits for all crawlers if they exist in config
            if (data.stop_at_date || data.max_tenders) {
                const defaultLimits: Record<string, { stopAtDate?: string, maxTenders?: number }> = {}
                filteredCrawlers.forEach(crawler => {
                    defaultLimits[crawler.id] = {
                        stopAtDate: data.stop_at_date ? data.stop_at_date.split('T')[0] : undefined,
                        maxTenders: data.max_tenders
                    }
                })
                setCrawlerLimits(defaultLimits)
            }

            // Load initial status for all crawlers to show last crawled dates
            await loadAllCrawlerStatus()
        } catch (error) {
            console.error('Failed to load crawler config', error)
        } finally {
            setLoading(false)
        }
    }

    const loadAllCrawlerStatus = async () => {
        // Fetch status for all implemented crawlers
        const crawlerIds = ['ted_austria', 'ted_switzerland', 'ted_germany', 'tender24', 'simap', 'bund', 'evergabe', 'austria', 'oeffentliche', 'tk', 'db', 'ad']
        const runningIds: string[] = []

        for (const crawlerId of crawlerIds) {
            try {
                const status = await api.getCrawlerStatus(crawlerId)
                if (status) {
                    setCrawlerStatus(prev => ({ ...prev, [crawlerId]: status }))

                    // If crawler is running, add to running crawlers set
                    if (status.status === 'running') {
                        runningIds.push(crawlerId)
                    }
                }
            } catch {
                // Ignore errors for crawlers that haven't run yet
                console.debug(`No status found for ${crawlerId}`)
            }
        }

        // Resume polling for any running crawlers
        if (runningIds.length > 0) {
            setRunningCrawlers(new Set(runningIds))
        }
    }

    const handleStopCrawler = async (crawlerId: string) => {
        if (!confirm(`Stop crawler ${crawlerId}?`)) return
        try {
            await api.stopCrawler(crawlerId)
            // polling will pick up status change
        } catch (e) {
            console.error('Failed to stop crawler', e)
            alert('Failed to stop crawler')
        }
    }



    const handleStartCrawler = async (crawlerId: string) => {
        console.log(`[CrawlerRunView] handleStartCrawler called for: ${crawlerId}`)
        if (!['ted_austria', 'ted_switzerland', 'ted_germany', 'tender24', 'simap', 'bund', 'evergabe', 'austria', 'oeffentliche', 'tk', 'db', 'ad'].includes(crawlerId)) {
            console.warn(`[CrawlerRunView] Unsupported crawler ID: ${crawlerId}`)
            alert(t('crawler_run.messages.unsupported'))
            return
        }

        // Get limits for this crawler
        const limits = crawlerLimits[crawlerId]
        const stopAtDate = limits?.stopAtDate
        const maxTenders = limits?.maxTenders

        // Validation
        if (stopAtDate) {
            const date = new Date(stopAtDate)
            if (date > new Date()) {
                alert(t('crawler_run.messages.error_date_past'))
                return
            }
        }

        if (maxTenders !== undefined) {
            if (isNaN(maxTenders)) {
                alert(t('crawler_run.messages.error_max_valid'))
                return
            }
            if (maxTenders <= 0) {
                alert(t('crawler_run.messages.error_max_positive'))
                return
            }
        }

        setRunningCrawlers(prev => new Set(prev).add(crawlerId))
        setCrawlerStatus(prev => ({ ...prev, [crawlerId]: { status: 'starting', progress: 0 } }))

        try {
            await api.startCrawler(crawlerId, stopAtDate, maxTenders)
            // Status polling will take over
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            setRunningCrawlers(prev => {
                const next = new Set(prev)
                next.delete(crawlerId)
                return next
            })
            console.error('Failed to start crawler', error)
            alert(`❌ ${t('crawler_run.messages.error_start_failed')}\n\nError: ${error.response?.data?.detail || error.message}`)
        }
    }

    const renderProgress = (crawlerId: string) => {
        const status = crawlerStatus[crawlerId]
        if (!status) return null

        // Don't show progress for idle status
        if (status.status === 'idle') return null

        // Calculate percentage
        let percentage = 0
        let text = t('crawler_run.progress.starting')

        if (status.status === 'running') {
            if (status.total_tenders > 0) {
                percentage = Math.round((status.tenders_processed / status.total_tenders) * 100)
                text = t('crawler_run.progress.crawled', { current: status.tenders_processed, total: status.total_tenders })
            } else {
                text = t('crawler_run.progress.running_init')
            }
        } else if (status.status === 'queued') {
            text = t('crawler_run.progress.queued')
        } else if (status.status === 'completed') {
            percentage = 100
            const stopReason = status.stop_reason
            let reasonText = ''
            if (stopReason === 'cutoffDate') {
                reasonText = t('crawler_run.progress.reason_cutoff')
            } else if (stopReason === 'maxTenders') {
                reasonText = t('crawler_run.progress.reason_max')
            } else if (stopReason === 'firstLimitHit') {
                reasonText = t('crawler_run.progress.reason_limit')
            }
            text = t('crawler_run.progress.completed', { count: status.tenders_found, reason: reasonText })
        } else if (status.status === 'failed') {
            percentage = 100
            text = t('crawler_run.progress.failed', { error: status.error || status.error_message || '' })
        } else if (status.tenders_found) {
            text = t('crawler_run.progress.found', { count: status.tenders_found })
        }

        return (
            <div style={{ marginTop: '8px', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <PText size="x-small">{text}</PText>
                    <PText size="x-small">{percentage}%</PText>
                </div>
                <div style={{
                    width: '100%',
                    height: '4px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '2px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        backgroundColor: 'var(--tf-accent)',
                        transition: 'width 0.3s ease'
                    }} />
                </div>
            </div>
        )
    }

    const renderCrawlerCard = (crawler: CrawlerInfo) => {
        const isRunning = runningCrawlers.has(crawler.id)

        return (
            <div
                key={crawler.id}
                style={{
                    backgroundColor: '#fff',
                    padding: '24px',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px'
                }}
            >
                {/* Icon */}
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    backgroundColor: crawler.type === 'company' ? '#fff0f2' : '#e3f2fd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <PIcon
                        name="arrow-right"
                        size="medium"
                        color={crawler.type === 'company' ? 'notification-error' : 'brand'}
                    />
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '8px' }}>
                        <PHeading size="small">{t(`crawler_run.crawlers.${crawler.id}.name`)}</PHeading>
                    </div>
                    <PText size="small" color="contrast-medium">
                        {t(`crawler_run.crawlers.${crawler.id}.description`)}
                    </PText>

                    {/* Last Crawled */}
                    {(() => {
                        const status = crawlerStatus[crawler.id]
                        if (status && status.end_time) {
                            const endTime = new Date(status.end_time)
                            const now = new Date()
                            const diffMs = now.getTime() - endTime.getTime()
                            const diffMins = Math.floor(diffMs / 60000)
                            const diffHours = Math.floor(diffMins / 60)
                            const diffDays = Math.floor(diffHours / 24)

                            let timeAgo = ''
                            if (diffDays > 0) {
                                timeAgo = `${diffDays} ${t('crawler_run.ago')}`
                            } else if (diffHours > 0) {
                                timeAgo = `${diffHours} ${t('crawler_run.ago')}`
                            } else if (diffMins > 0) {
                                timeAgo = `${diffMins} ${t('crawler_run.ago')}`
                            } else {
                                timeAgo = t('crawler_run.just_now')
                            }

                            return (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                                    <PIcon name="clock" size="x-small" color="notification-success" />
                                    <PText size="x-small" color="contrast-medium">
                                        {t('crawler_run.latest_data')}: <strong>{timeAgo}</strong> ({endTime.toLocaleString()})
                                    </PText>
                                </div>
                            )
                        }
                        return (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                                <PIcon name="clock" size="x-small" color="contrast-low" />
                                <PText size="x-small" color="contrast-low">
                                    {t('crawler_run.latest_data')}: No data yet
                                </PText>
                            </div>
                        )
                    })()}

                    {/* Limit Configuration */}
                    <div style={{ marginTop: '12px' }}>
                        <button
                            onClick={() => {
                                setExpandedLimits(prev => {
                                    const next = new Set(prev)
                                    if (next.has(crawler.id)) {
                                        next.delete(crawler.id)
                                    } else {
                                        next.add(crawler.id)
                                    }
                                    return next
                                })
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#1976d2',
                                cursor: 'pointer',
                                fontSize: '12px',
                                padding: '4px 0',
                                textDecoration: 'underline'
                            }}
                        >
                            {expandedLimits.has(crawler.id) ? `▼ ${t('crawler_run.hide_limits')}` : `▶ ${t('crawler_run.set_limits')}`}
                        </button>

                        {expandedLimits.has(crawler.id) && (
                            <div style={{
                                marginTop: '12px',
                                padding: '12px',
                                backgroundColor: '#f5f5f5',
                                borderRadius: '4px',
                                display: 'flex',
                                gap: '12px',
                                flexWrap: 'wrap'
                            }}>
                                <div style={{ flex: '1 1 200px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                                        {t('crawler_run.stop_at_date')}
                                    </label>
                                    <input
                                        type="date"
                                        value={crawlerLimits[crawler.id]?.stopAtDate || ''}
                                        onChange={(e) => {
                                            setCrawlerLimits(prev => ({
                                                ...prev,
                                                [crawler.id]: {
                                                    ...prev[crawler.id],
                                                    stopAtDate: e.target.value
                                                }
                                            }))
                                        }}
                                        max={new Date().toISOString().split('T')[0]}
                                        style={{
                                            width: '100%',
                                            padding: '6px 8px',
                                            fontSize: '13px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            backgroundColor: '#ffffff',
                                            color: '#000000',
                                            colorScheme: 'light'
                                        }}
                                    />
                                    <PText size="x-small" color="contrast-medium" style={{ marginTop: '4px' }}>
                                        {t('crawler_run.stop_hint')}
                                    </PText>
                                </div>

                                <div style={{ flex: '1 1 200px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                                        {t('crawler_run.max_tenders')}
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={crawlerLimits[crawler.id]?.maxTenders || ''}
                                        onChange={(e) => {
                                            const value = e.target.value ? parseInt(e.target.value) : undefined
                                            setCrawlerLimits(prev => ({
                                                ...prev,
                                                [crawler.id]: {
                                                    ...prev[crawler.id],
                                                    maxTenders: value
                                                }
                                            }))
                                        }}
                                        placeholder="No limit"
                                        style={{
                                            width: '100%',
                                            padding: '6px 8px',
                                            fontSize: '13px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            backgroundColor: '#ffffff',
                                            color: '#000000',
                                            colorScheme: 'light'
                                        }}
                                    />
                                    <PText size="x-small" color="contrast-medium" style={{ marginTop: '4px' }}>
                                        {t('crawler_run.max_hint')}
                                    </PText>
                                </div>
                            </div>
                        )}
                    </div>

                    {renderProgress(crawler.id)}
                </div>

                {/* Action */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    {isRunning ? (
                        <>
                            <PButton
                                variant="secondary"
                                loading={crawlerStatus[crawler.id]?.status === 'running' || crawlerStatus[crawler.id]?.status === 'starting'}
                                disabled={crawlerStatus[crawler.id]?.status === 'stopping'}
                            >
                                {crawlerStatus[crawler.id]?.status === 'queued' ? t('crawler_run.queued') : t('crawler_run.running')}
                            </PButton>
                            <PButton
                                variant="tertiary"
                                icon="close"
                                onClick={() => handleStopCrawler(crawler.id)}
                                style={{ marginTop: '4px' }}
                            >
                                {t('crawler_run.stop_crawler')}
                            </PButton>
                        </>
                    ) : (
                        <PButton
                            onClick={() => {
                                console.log(`[CrawlerRunView] Start button clicked for ${crawler.id}`);
                                handleStartCrawler(crawler.id);
                            }}
                            onAction={() => {
                                console.log(`[CrawlerRunView] Start button action for ${crawler.id}`);
                                handleStartCrawler(crawler.id);
                            }}
                            disabled={false}
                            icon="arrow-right"
                        >
                            {t('crawler_run.start_crawler')}
                        </PButton>
                    )}
                </div>
            </div>
        )
    }

    if (loading) {
        return (
        <div style={{ maxWidth: '1760px', margin: '0 auto', padding: '0 24px' }}>
            <div style={{ padding: '32px 0' }}>
                <PText>{t('common.loading')}</PText>
            </div>
        </div>
        )
    }

    if (!config) {
        return (
        <div style={{ maxWidth: '1760px', margin: '0 auto', padding: '0 24px' }}>
            <div style={{ padding: '32px 0' }}>
                <PText>Failed to load configuration</PText>
            </div>
        </div>
        )
    }

    return (
        <div style={{ maxWidth: '1760px', margin: '0 auto', padding: '0 24px' }}>
            <div style={{ padding: '32px 0' }}>
                <div style={{ marginBottom: '24px' }}>
                    <PHeading size="medium">{t('crawler_run.title')}</PHeading>
                    <PText size="small" style={{ marginTop: '8px' }}>
                        {t('crawler_run.subtitle')}
                    </PText>
                </div>

                <PDivider style={{ marginBottom: '24px' }} />

                {/* Active & Queued List */}
                <CrawlerQueueList />

                {/* Crawlers List Container */}
                <div style={{ padding: '24px', backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                    <PHeading size="medium" style={{ marginBottom: '24px' }}>{t('crawler_run.available_crawlers')}</PHeading>

                    {/* Portals Section */}
                    <div style={{ marginBottom: '32px' }}>
                        <PHeading size="small" style={{ marginBottom: '16px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('crawler_run.portals')}</PHeading>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {filteredCrawlers.filter(c => c.type === 'portal').map(crawler => renderCrawlerCard(crawler))}
                        </div>
                    </div>

                    {/* Companies Section */}
                    {crawlers.filter(c => c.type === 'company').length > 0 && (
                        <div>
                            <PHeading size="small" style={{ marginBottom: '16px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('crawler_run.companies')}</PHeading>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {filteredCrawlers.filter(c => c.type === 'company').map(crawler => renderCrawlerCard(crawler))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}

export default CrawlerRunView
