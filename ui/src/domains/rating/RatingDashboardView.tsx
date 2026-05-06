import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {PHeading,
    PText,
    PFlex,
    PSpinner,
    PDivider,
    PButton} from '@porsche-design-system/components-react';
import { TenderDetailDrawer } from '../../components/TenderDetailDrawer';
import { useURLState } from '../../hooks/useURLState';
import { GenericTenderTable } from '../../components/GenericTenderTable';
import { api as crawlerApi } from '../sourcing/api';
import { api as ratingApi } from './api';
import { StandardPageHeader } from '../../components/StandardPageHeader';
import { GenericTenderFilter } from '../../components/GenericTenderFilter';
import { DistributionChart } from '../../components/AnalyticsCharts';
import type { Tender } from '../../components/GenericTenderTable.types';



interface RatingDashboardProps {
    dbMode: 'disconnected' | 'cosmos';
}

/**
 * Rating Analysis View
 * 
 *
 * Expert-tier interface for tender analysis, keyword verification,
 * and strategic opportunity discovery.
 */
const RatingDashboardView: React.FC<RatingDashboardProps> = ({ dbMode }) => {
    const BUCKET_SIZE = 10;
    // --- useURLState (URL Sync for BI Filters) ---
    const [searchQuery, setSearchQuery] = useURLState('search', '');
    const [websiteFilter, setWebsiteFilter] = useURLState('website', '');
    const [filterBy, setFilterBy] = useURLState('filterBy', 'crawl');
    const [dateMode, setDateMode] = useState<'single' | 'range'>('single');

    const getLocalDateString = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const today = getLocalDateString(new Date());
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [selectedDate, setSelectedDate] = useURLState('date', today);
    const [rangeStart, setRangeStart] = useURLState('start', getLocalDateString(sevenDaysAgo));
    const [rangeEnd, setRangeEnd] = useURLState('end', today);

    const [ratingMinStr, setRatingMinStr] = useURLState('rating_min', '');
    const ratingMin = ratingMinStr ? parseFloat(ratingMinStr) : null;
    const setRatingMin = (val: number | null) => setRatingMinStr(val === null ? '' : val.toString());

    const [ratingMaxStr, setRatingMaxStr] = useURLState('rating_max', '');
    const ratingMax = ratingMaxStr ? parseFloat(ratingMaxStr) : null;
    const setRatingMax = (val: number | null) => setRatingMaxStr(val === null ? '' : val.toString());

    const [typeFilter, setTypeFilter] = useURLState('type', '');
    const [subTypeFilter, setSubTypeFilter] = useURLState('subtype', '');

    // Sort & Pagination Params in URL
    const [sortBy, setSortBy] = useURLState('sort', 'rating_total');
    const [sortDir, setSortDir] = useURLState('dir', 'desc');

    const [pageStr, setPageStr] = useURLState('page', '0');
    const page = parseInt(pageStr) || 0;
    const setPage = (val: number | ((prev: number) => number)) => {
        const next = typeof val === 'function' ? val(page) : val;
        setPageStr(next.toString());
    };

    // --- Component State ---
    const [tenders, setTenders] = useState<Tender[]>([]);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    const [keywordTree, setKeywordTree] = useState<Record<string, string[]>>({});
    // const [stats, setStats] = useState<{ total: number, by_website: Record<string, number> } | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
    const [distribution, setDistribution] = useState<any[]>([]);
    const [distributionLoading, setDistributionLoading] = useState(false);

    const buildBucketsFromApi = (dist: any[]) => {
        if (!dist || dist.length === 0) return [];
        // If API already returns buckets per website, keep structure {label, total, per website}
        const isStacked = dist.some((d: any) => d.website && d.count !== undefined);
        if (isStacked) {
            const grouped: Record<string, Record<string, number>> = {};
            dist.forEach((d: any) => {
                const bucket = (d.score ?? 0).toString();
                grouped[bucket] = grouped[bucket] || {};
                grouped[bucket][d.website || 'Unknown'] = (d.count ?? 0);
            });
            return Object.entries(grouped).map(([label, websites]) => {
                const total = Object.values(websites).reduce((a, b) => a + (b as number), 0);
                return {
                    label,
                    count: total,
                    ...websites,
                };
            });
        }
        const sorted = [...dist].sort((a: any, b: any) => (a.score ?? 0) - (b.score ?? 0));
        const buckets: any[] = [];
        if (sorted.length === 0) return [];

        const minRaw = sorted[0].score ?? 0;
        const maxRaw = sorted[sorted.length - 1].score ?? 0;

        const min = Math.floor(minRaw / BUCKET_SIZE) * BUCKET_SIZE;
        const max = Math.ceil(maxRaw / BUCKET_SIZE) * BUCKET_SIZE;

        for (let s = min; s <= max; s += BUCKET_SIZE) {
            const found = sorted.find((d: any) => d.score === s);
            buckets.push({ label: s.toString(), count: found ? found.count || 0 : 0 });
        }
        return buckets;
    };

    const buildBucketsFromTenders = (rows: Tender[]) => {
        if (!rows || rows.length === 0) return [{ label: '0', count: 0 }];
        const counts: Record<number, Record<string, number>> = {};
        let min = Infinity;
        let max = -Infinity;

        rows.forEach(t => {
            const score = Math.floor((t.rating_total ?? 0) / BUCKET_SIZE) * BUCKET_SIZE;
            const website = t.name_website || 'Unknown';
            if (!counts[score]) counts[score] = {};
            counts[score][website] = (counts[score][website] || 0) + 1;
            min = Math.min(min, score);
            max = Math.max(max, score);
        });

        // If (rarely) no valid scores found, fallback to 0 range
        if (min === Infinity) { min = 0; max = 0; }

        const buckets: any[] = [];
        for (let s = min; s <= max; s += BUCKET_SIZE) {
            buckets.push({ label: s.toString(), ...counts[s], count: Object.values(counts[s] || {}).reduce((a, b) => a + (b as number), 0) });
        }
        return buckets.length ? buckets : [{ label: '0', count: 0 }];
    };

    const observerTarget = useRef<HTMLDivElement>(null);
    const limit = 50;

    const websiteOptions = useMemo(() => [
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
    ], []);

    // --- Data Fetching ---

    const fetchMetadata = useCallback(async () => {
        try {
            const [cats, tree] = await Promise.all([
                ratingApi.getCategories(),
                ratingApi.getKeywordTree()
            ]);
            setCategories(cats);
            setKeywordTree(tree);

            // Tender stats is optional - don't block if it fails
            // try {
            //     const tenderStats = await crawlerApi.getTenderStats();
            //     setStats(tenderStats);
            // } catch (statsError) {
            //     console.warn("Tender stats not available", statsError);
            // }
        } catch (e) {
            console.error("Failed to fetch metadata", e);
        }
    }, []);

    const fetchTenders = useCallback(async (reset = false, pageParam?: number) => {
        if (dbMode === 'disconnected' || (loading && !reset)) return;
        setLoading(true);
        try {
            const pageToUse = reset ? 0 : (pageParam ?? page ?? 0);
            const currentOffset = pageToUse * limit;

            // Date calculations
            let since = undefined;
            let until = undefined;

            if (dateMode === 'single') {
                if (selectedDate) {
                    since = `${selectedDate}T00:00:00`;
                    until = `${selectedDate}T23:59:59`;
                }
            } else {
                if (rangeStart) since = `${rangeStart}T00:00:00`;
                if (rangeEnd) until = `${rangeEnd}T23:59:59`;
            }

            const searchParams: any = {
                search: searchQuery || undefined,
                website: websiteFilter || undefined,
                limit: limit,
                offset: currentOffset,
                rating_min: ratingMin ?? undefined,
                rating_max: ratingMax ?? undefined,
                rating_type: typeFilter || undefined,
                rating_subtype: subTypeFilter || undefined,
                sort_by: sortBy || 'rating_total',
                sort_dir: sortDir || 'desc'
            };

            if (filterBy === 'published') {
                searchParams.published_min = since;
                searchParams.published_max = until;
            } else if (filterBy === 'enriched') {
                searchParams.enriched_since = since;
                searchParams.enriched_until = until;
                // Also pass for distribution if single date mode, trying best effort mapping
                if (dateMode === 'single' && selectedDate) {
                    searchParams.enriched_date = selectedDate;
                }
            } else {
                searchParams.crawled_since = since;
                searchParams.crawled_until = until;
            }

            const data = await crawlerApi.searchTenders(searchParams);

            if (reset) {
                // Fetch distribution (exclude pagination/sort)
                const { limit, offset, sort_by, sort_dir, ...distParams } = searchParams;
                setDistributionLoading(true);
                crawlerApi.getScoreDistribution(distParams)
                    .then(dist => {
                        const buckets: any[] = buildBucketsFromApi(dist);
                        setDistribution(buckets.length ? buckets : buildBucketsFromTenders(data));
                    })
                    .catch(e => {
                        console.error("Failed to fetch distribution", e);
                        setDistribution(buildBucketsFromTenders(data));
                    })
                    .finally(() => setDistributionLoading(false));

                setTenders(data);
                setPage(1);
            } else {
                setTenders((prev: Tender[]) => [...prev, ...data]);
                setPage(prev => (prev || 0) + 1);
            }

            setHasMore(data.length === limit);
        } catch (error) {
            console.error("Failed to fetch tenders", error);
        } finally {
            setLoading(false);
        }
    }, [dbMode, filterBy, dateMode, selectedDate, rangeStart, rangeEnd, searchQuery, websiteFilter, ratingMin, ratingMax, typeFilter, subTypeFilter, sortBy, sortDir, limit]);


    // --- Side Effects ---

    useEffect(() => {
        fetchMetadata();
    }, [fetchMetadata]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTenders(true);
        }, 50);
        return () => clearTimeout(timer);
    }, [fetchTenders]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loading) fetchTenders(false, page ?? 0);
            },
            { threshold: 0.1 }
        );
        if (observerTarget.current) observer.observe(observerTarget.current);
        return () => observer.disconnect();
    }, [hasMore, loading, fetchTenders, page]);

    if (dbMode === 'disconnected') {
        return (
            <div className="p-content-wrapper">
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <PHeading size="large">Database Offline</PHeading>
                    <PText style={{ marginTop: '16px' }}>Connect to Cosmos DB to unlock the Intelligence Hub.</PText>
                </div>
            </div>
        );
    }

    return (
        <div className="p-content-wrapper">
            <div style={{ padding: '0 24px' }}>
                <PFlex direction="column" style={{ gap: '24px', marginTop: '24px' }}>
                    <StandardPageHeader
                        title="Scoring Analysis"
                        subtitle="Analyze tender ratings, review keyword matches, and discovery opportunities."
                    >
                        <GenericTenderFilter
                            variant="rating"
                            searchText={searchQuery}
                            onSearchChange={setSearchQuery}
                            selectedWebsite={websiteFilter}
                            onWebsiteChange={setWebsiteFilter}
                            websites={websiteOptions}
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
                            ratingMin={ratingMin}
                            onRatingMinChange={setRatingMin}
                            ratingMax={ratingMax}
                            onRatingMaxChange={setRatingMax}
                            typeFilter={typeFilter}
                            onTypeChange={setTypeFilter}
                            subTypeFilter={subTypeFilter}
                            onSubTypeChange={setSubTypeFilter}
                            categories={categories}
                            keywordTree={keywordTree}
                        />
                    </StandardPageHeader>

                    <div style={{
                        backgroundColor: '#111',
                        padding: '24px',
                        borderRadius: '8px',
                        height: '350px',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <PHeading size="small" theme="dark">Scoring Distribution</PHeading>
                                <PFlex style={{ gap: '12px', marginTop: '4px' }}>
                                    <PText size="x-small" theme="dark" color="contrast-medium">
                                        Total Tenders: {distribution ? distribution.reduce((acc, curr) => acc + (curr.count as number || 0), 0) : 0}
                                    </PText>
                                </PFlex>
                            </div>
                        </div>
                        <div style={{ flex: 1, marginTop: '20px', width: '100%', height: '100%' }}>
                            {!distributionLoading && distribution && distribution.length > 0 ? (
                                <DistributionChart
                                    data={distribution}
                                    series={
                                        (() => {
                                            const keys = Array.from(
                                                distribution.reduce((set: Set<string>, row: any) => {
                                                    Object.keys(row).forEach(k => {
                                                        if (k !== 'label' && k !== 'count') set.add(k);
                                                    });
                                                    return set;
                                                }, new Set<string>())
                                            );

                                            // Fallback to 'count' if no stacked keys found
                                            if (keys.length === 0) {
                                                return [{ key: 'count', label: 'Tenders', color: 'var(--tf-accent)' }];
                                            }

                                            return keys.map((key, idx) => ({
                                                key,
                                                label: key,
                                                color: ['var(--tf-accent)', 'var(--tf-accent-2)', '#00a676', '#ffb000', '#7c3aed'][idx % 5]
                                            }));
                                        })()
                                    }
                                    height={260}
                                />
                            ) : (
                                <PFlex justifyContent="center" alignItems="center" style={{ height: '100%' }}>
                                    {distributionLoading ? <PSpinner theme="dark" /> : <PText theme="dark">No data for selected period</PText>}
                                </PFlex>
                            )}
                        </div>
                    </div>

                    <PDivider />

                    <GenericTenderTable
                        data={tenders as any}
                        loading={loading}
                        hasMore={hasMore}
                        onLoadMore={() => fetchTenders(false)}
                        onRowClick={(tender: any) => setSelectedTender(tender)}
                        sorting={[{ id: sortBy, desc: sortDir === 'desc' }]}
                        onSortingChange={(updater: any) => {
                            const newState = typeof updater === 'function' ? updater([{ id: sortBy, desc: sortDir === 'desc' }]) : updater;
                            if (newState.length > 0) {
                                setSortBy(newState[0].id);
                                setSortDir(newState[0].desc ? 'desc' : 'asc');
                            }
                        }}
                        visibleColumns={['published', 'website', 'headline', 'rating_total', 'est_volume', 'pdfs', 'due', 'actions']}
                    />
                </PFlex>

                {/* Tender Detail Modal */}
                <TenderDetailDrawer
                    tender={selectedTender as any}
                    isOpen={!!selectedTender}
                    onClose={() => setSelectedTender(null)}
                />

                <div style={{ marginTop: '48px', padding: '24px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                    <PHeading size="small">Maintenance</PHeading>
                    <PText size="small" style={{ marginBottom: '16px' }}>actions to maintain data consistency.</PText>
                    <PButton
                        variant="secondary"
                        onClick={async () => {
                            try {
                                await fetch('/api/qualification/rerate-not-enriched', { method: 'POST' });
                                alert('Rerate process started in background');
                            } catch (e) {
                                alert('Failed to start process');
                            }
                        }}
                    >
                        Rerate Unrated Tenders (Score = 0)
                    </PButton>
                </div>
            </div>
        </div>
    );
};

export default RatingDashboardView;
