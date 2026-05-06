import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {PHeading,
    PText,
    PSpinner,
    PDivider} from '@porsche-design-system/components-react';
import { StandardPageHeader } from '../../components/StandardPageHeader';
import type { SortingState } from '@tanstack/react-table';
import { api as crawlerApi } from './api';
import { StackedBarChart, type StackedBarChartDataPoint } from '../../components/AnalyticsCharts';
import { useURLState } from '../../hooks/useURLState';
import { GenericTenderFilter } from '../../components/GenericTenderFilter';

interface Tender {
    id: string;
    internal_id: string;
    external_id: string;
    headline: string;
    description: string;
    caller: string;
    published: string;
    due: string;
    crawl_time: string;
    name_website: string;
    url: string;
    rating_by_subtype?: Record<string, number>;
    rating_total?: number;
    ai_enriched_at?: string;
}

import { GenericTenderTable } from '../../components/GenericTenderTable';

const CrawlingAnalysisView = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    // 1. Filter State
    const [searchText, setSearchText] = useURLState('search', '');
    const [selectedWebsite, setSelectedWebsite] = useURLState('website', '');
    const [filterBy, setFilterBy] = useURLState('filterBy', 'crawl');

    // Date Logic State
    const [dateMode, setDateMode] = useState<'single' | 'range'>('single');

    // Single Mode: Default to Today (using local time for Germany/CET timezone)
    const getLocalDateString = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const today = getLocalDateString(new Date());
    const [selectedDate, setSelectedDate] = useURLState('date', today);

    // Range Mode: Default to Last 7 Days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const [rangeStart, setRangeStart] = useURLState('start', getLocalDateString(sevenDaysAgo));
    const [rangeEnd, setRangeEnd] = useURLState('end', today);

    // 2. Data State
    const [tenders, setTenders] = useState<Tender[]>([]);
    const [timeline, setTimeline] = useState<StackedBarChartDataPoint[]>([]);
    const [loading, setLoading] = useState(false);
    const [timelineLoading, setTimelineLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const LIMIT = 50;

    // 3. Table State
    const [sorting, setSorting] = useState<SortingState>([]);
    const websites = [
        { label: 'All Sources', value: '' },
        { label: 'TED Europe', value: 'TED Europe' },
        { label: 'Austria USP', value: 'Austria USP' },
        { label: 'Bund.de', value: 'Bund.de' },
        { label: 'SIMAP', value: 'SIMAP' },
        { label: 'Tender24', value: 'Tender24' },
        { label: 'e-Vergabe', value: 'e-Vergabe' },
        { label: 'Öffentliche Vergabe', value: 'Öffentliche Vergabe' },
        { label: 'TK Vergabe', value: 'TK Vergabe' },
        { label: 'DB Vergabe', value: 'DB Vergabe' },
        { label: 'Ausschreibungen Deutschland', value: 'Ausschreibungen Deutschland' },
    ];

    const crawlerColors: Record<string, string> = {
        // MHP blue palette (keep PDS components)
        'TED Europe': 'var(--tf-accent)',
        'Austria USP': '#3a43ff',
        'Bund.de': '#000778',
        'SIMAP': '#7280ff',
        'Tender24': '#1612ff',
        'e-Vergabe': '#a5b2ff',
        'Öffentliche Vergabe': '#cdd6ff',
        'TK Vergabe': '#7280ff',
        'DB Vergabe': '#3a43ff',
        'Ausschreibungen Deutschland': 'var(--tf-accent)',
        'Unknown': '#262626'
    };

    // Calculate Filter Parameters
    const getFilterParams = () => {
        let since = undefined;
        let until = undefined;

        if (dateMode === 'single') {
            since = `${selectedDate}T00:00:00`;
            until = `${selectedDate}T23:59:59`;
        } else {
            since = `${rangeStart}T00:00:00`;
            until = `${rangeEnd}T23:59:59`;
        }

        const params: any = {
            search: searchText || undefined,
            website: selectedWebsite || undefined
        };

        if (filterBy === 'published') {
            params.published_min = since;
            params.published_max = until;
        } else if (filterBy === 'enriched') {
            params.enriched_since = since;
            params.enriched_until = until;
        } else {
            params.crawled_since = since;
            params.crawled_until = until;
        }

        return params;
    };

    // 4. Fetching Logic
    const fetchData = async (isNewSearch = false) => {
        setLoading(true);
        const currentOffset = isNewSearch ? 0 : offset;
        const filters = getFilterParams();

        try {
            const data = await crawlerApi.searchTenders({
                ...filters,
                limit: LIMIT,
                offset: currentOffset,
                sort_by: sorting[0]?.id || 'published',
                sort_dir: sorting[0]?.desc ? 'desc' : 'asc'
            });

            if (isNewSearch) {
                setTenders(data);
                setOffset(LIMIT);
            } else {
                setTenders(prev => [...prev, ...data]);
                setOffset(prev => prev + LIMIT);
            }
            setHasMore(data.length === LIMIT);
        } catch (error) {
            console.error('Failed to fetch tenders:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTimeline = async () => {
        setTimelineLoading(true);
        let since = undefined;
        let until = undefined;
        const nowIso = new Date().toISOString().split('T')[0];

        if (dateMode === 'single') {
            // End at selectedDate, but capped at today
            const end = new Date(selectedDate > nowIso ? nowIso : selectedDate);
            const start = new Date(end);
            start.setDate(start.getDate() - 6);

            since = `${start.toISOString().split('T')[0]}T00:00:00`;
            until = `${end.toISOString().split('T')[0]}T23:59:59`;
        } else {
            since = `${rangeStart}T00:00:00`;
            until = `${rangeEnd > nowIso ? nowIso : rangeEnd}T23:59:59`;
        }

        const timelineFilters: any = {
            search: searchText || undefined,
            website: selectedWebsite || undefined
        };

        if (filterBy === 'published') {
            timelineFilters.published_min = since;
            timelineFilters.published_max = until;
        } else if (filterBy === 'enriched') {
            timelineFilters.enriched_since = since;
            timelineFilters.enriched_until = until;
        } else {
            timelineFilters.crawled_since = since;
            timelineFilters.crawled_until = until;
        }

        try {
            const data = await crawlerApi.getDateDistribution(timelineFilters);

            // Fill missing days with 0s for the range [since, until]
            const result = [];
            const startDate = new Date(since!.split('T')[0]);
            const endDate = new Date(until!.split('T')[0]);

            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                const existing = data.find(item => item.date === dateStr);

                if (existing) {
                    let total = 0;
                    Object.keys(existing).forEach(k => {
                        if (k !== 'date' && k !== 'published' && k !== 'due') total += (existing[k] as number);
                    });
                    result.push({ ...existing, _total: total });
                } else {
                    result.push({ date: dateStr, _total: 0 });
                }
            }

            setTimeline(result);
        } catch (error) {
            console.error('Failed to fetch timeline:', error);
            setTimeline([]);
        } finally {
            setTimelineLoading(false);
        }
    };

    // 5. Initial Load & Filter Changes
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchData(true);
            fetchTimeline();
        }, 300);
        return () => clearTimeout(handler);
    }, [searchText, selectedWebsite, filterBy, dateMode, selectedDate, rangeStart, rangeEnd, sorting]);


    // 7. Infinite Scroll
    const observerTarget = useRef(null);
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    fetchData();
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [hasMore, loading, offset]);


    // Chart Series construction
    const chartSeries = useMemo(() => {
        const keys = new Set<string>();
        timeline.forEach(t => {
            Object.keys(t).forEach(k => {
                if (k !== 'date' && k !== 'published' && k !== 'due' && k !== '_total') {
                    keys.add(k);
                }
            });
        });

        return Array.from(keys).map(key => ({
            key,
            // Use White for Bund.de in Dark Chart config, else default map
            color: crawlerColors[key] || '#999',
            label: key
        }));
    }, [timeline]);

    return (
        <div style={{ maxWidth: '1760px', margin: '0 auto', padding: '0 24px' }}>
            <div style={{ padding: '32px 0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <StandardPageHeader
                        title={t('analysis.title')}
                        subtitle={t('analysis.subtitle')}
                    >
                        <GenericTenderFilter
                            variant="crawling"
                            searchText={searchText}
                            onSearchChange={setSearchText}
                            selectedWebsite={selectedWebsite}
                            onWebsiteChange={setSelectedWebsite}
                            websites={websites}
                            filterBy={filterBy as any}
                            onFilterByChange={setFilterBy as any}
                            dateMode={dateMode}
                            onDateModeChange={setDateMode}
                            selectedDate={selectedDate}
                            onSelectedDateChange={setSelectedDate}
                            rangeStart={rangeStart}
                            onRangeStartChange={setRangeStart}
                            rangeEnd={rangeEnd}
                            onRangeEndChange={setRangeEnd}
                            onResetFilters={() => {
                                setSearchText('');
                                setSelectedWebsite('');
                                setSelectedDate(today);
                            }}
                        />
                    </StandardPageHeader>

                    <div style={{
                        backgroundColor: '#111',
                        padding: '1.5rem',
                        borderRadius: '4px',
                        border: '1px solid #333',
                        height: '350px',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <PHeading size="small" theme="dark">{t('analysis.crawler_activity')}</PHeading>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                                    <PText size="x-small" theme="dark" color="contrast-medium">
                                        {t('analysis.total_tenders')}: {timeline.reduce((acc, curr) => acc + (curr._total as number || 0), 0)}
                                    </PText>
                                </div>
                            </div>
                        </div>
                        <div style={{ flex: 1, marginTop: '20px', width: '100%', height: '100%' }}>
                            {!timelineLoading && timeline.length > 0 ? (
                                <StackedBarChart
                                    data={timeline}
                                    series={chartSeries}
                                    height={260}
                                />
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    {timelineLoading ? <PSpinner theme="dark" /> : <PText theme="dark">{t('analysis.no_data_chart')}</PText>}
                                </div>
                            )}
                        </div>
                    </div>

                    <PDivider />

                    {!loading && tenders.length === 0 && searchText && (
                        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', margin: '20px 0' }}>
                            <PHeading size="small" style={{ marginBottom: '8px' }}>{t('analysis.no_results', { search: searchText })}</PHeading>
                            <PText color="contrast-medium">
                                {t('analysis.no_results', { search: searchText })}
                            </PText>
                        </div>
                    )}

                    <GenericTenderTable
                        data={tenders as any}
                        loading={loading}
                        hasMore={hasMore}
                        onLoadMore={() => fetchData()}
                        onRowClick={(tender: any) => navigate(`/tenders/${tender.id}`)}
                        sorting={sorting}
                        onSortingChange={setSorting}
                        visibleColumns={['published', 'website', 'headline', 'due', 'actions']}
                        crawlerColors={crawlerColors}
                    />
                </div>
            </div>
        </div>
    );
};

export default CrawlingAnalysisView;
