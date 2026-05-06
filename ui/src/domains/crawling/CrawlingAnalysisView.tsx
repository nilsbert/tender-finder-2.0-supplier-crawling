import { useState, useEffect, useRef, useMemo } from 'react';
import {PHeading,
    PText,
    PFlex,
    PSpinner,
    PDivider,
    PButton,
    PIcon} from '@porsche-design-system/components-react';
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    type SortingState,
} from '@tanstack/react-table';
import { api as crawlerApi } from './api';
import { TimelineChart, LegendItem, type TimelineDataPoint } from '../../components/AnalyticsCharts.tsx';
import { GlobalFilterHeader, type FilterValues } from '../../components/GlobalFilterHeader.tsx';
import { TenderDetailDrawer } from '../../components/TenderDetailDrawer.tsx';

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
}

const CrawlingAnalysisView = () => {
    // 1. Filter State
    const [filters, setFilters] = useState<FilterValues>({
        searchText: '',
        selectedWebsite: '',
        crawledSince: '',
        dueUntil: '',
    });

    // 2. Data State
    const [tenders, setTenders] = useState<Tender[]>([]);
    const [timeline, setTimeline] = useState<TimelineDataPoint[]>([]);
    const [loading, setLoading] = useState(false);
    const [timelineLoading, setTimelineLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const LIMIT = 20;

    // 3. Table State
    const [sorting, setSorting] = useState<SortingState>([]);
    const [selectedTender, setSelectedTender] = useState<Tender | null>(null);

    // 4. Fetching Logic
    const fetchData = async (isNewSearch = false) => {
        setLoading(true);
        const currentOffset = isNewSearch ? 0 : offset;

        try {
            const data = await crawlerApi.searchTenders({
                search: filters.searchText,
                website: filters.selectedWebsite,
                crawled_since: filters.crawledSince,
                due_until: filters.dueUntil,
                limit: LIMIT,
                offset: currentOffset,
                sort_by: sorting[0]?.id || 'crawl_time',
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
        try {
            const data = await crawlerApi.getDateDistribution({
                search: filters.searchText,
                website: filters.selectedWebsite,
                crawled_since: filters.crawledSince
            });
            setTimeline(data);
        } catch (error) {
            console.error('Failed to fetch timeline:', error);
        } finally {
            setTimelineLoading(false);
        }
    };

    // 5. Initial Load & Filter Changes
    useEffect(() => {
        fetchData(true);
        fetchTimeline();
    }, [filters, sorting]);

    // 6. Infinite Scroll
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

    // 7. Table Configuration
    const columns = useMemo(() => [
        {
            header: 'Crawler Date',
            accessorKey: 'crawl_time',
            cell: (info: any) => info.getValue() ? new Date(info.getValue()).toLocaleDateString() : 'N/A',
        },
        {
            header: 'Website',
            accessorKey: 'name_website',
        },
        {
            header: 'Caller',
            accessorKey: 'caller',
            cell: (info: any) => <div style={{ fontWeight: '600' }}>{info.getValue()}</div>,
        },
        {
            header: 'Headline',
            accessorKey: 'headline',
            cell: (info: any) => (
                <div style={{
                    maxWidth: '400px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {info.getValue()}
                </div>
            ),
        },
        {
            header: 'Published',
            accessorKey: 'published',
            cell: (info: any) => info.getValue() ? new Date(info.getValue()).toLocaleDateString() : 'N/A',
        }
    ], []);

    const table = useReactTable({
        data: tenders,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="p-content-wrapper">
            <PFlex direction="column" style={{ gap: '32px', marginTop: '32px' }}>
                {/* 1. Header & Filters */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                }}>
                    <PFlex justifyContent="space-between" alignItems="center" style={{ marginBottom: '24px' }}>
                        <div>
                            <PHeading size="large">Crawling Analysis Console</PHeading>
                            <PText size="small" color="contrast-medium">Monitor and analyze tender intake performance</PText>
                        </div>
                    </PFlex>

                    <GlobalFilterHeader
                        filters={filters}
                        onFilterChange={setFilters}
                        showRatingFilters={false}
                    />
                </div>

                {/* 2. Visual Intelligene Row: Crawling Chart */}
                <div style={{
                    backgroundColor: '#111',
                    padding: '24px',
                    borderRadius: '12px',
                    height: '400px',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <PHeading size="small" theme="dark">Intake performance</PHeading>
                            <PText size="x-small" theme="dark" color="contrast-medium">Number of tenders crawled per day</PText>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                            <LegendItem color="#1976d2" label="Crawled" />
                        </div>
                    </div>
                    <div style={{ flex: 1, marginTop: '20px', width: '100%', height: '100%' }}>
                        {!timelineLoading && timeline ? (
                            <TimelineChart
                                data={timeline}
                                series={[
                                    { key: 'crawled', color: '#1976d2', label: 'Crawled' }
                                ]}
                            />
                        ) : (
                            <PFlex justifyContent="center" alignItems="center" style={{ height: '100%' }}>
                                <PSpinner theme="dark" />
                            </PFlex>
                        )}
                    </div>
                </div>

                <PDivider />

                {/* 3. Table Workspace */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '1px solid #ddd',
                    overflow: 'hidden'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead style={{ backgroundColor: '#f9f9f9', borderBottom: '2px solid #ddd' }}>
                            {table.getHeaderGroups().map(hg => (
                                <tr key={hg.id}>
                                    {hg.headers.map(header => (
                                        <th
                                            key={header.id}
                                            onClick={header.column.getToggleSortingHandler()}
                                            style={{
                                                padding: '16px',
                                                textAlign: 'left',
                                                cursor: header.column.getCanSort() ? 'pointer' : 'default',
                                                userSelect: 'none'
                                            }}
                                        >
                                            <PFlex alignItems="center" style={{ gap: '8px' }}>
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.getIsSorted() === 'asc' && <PIcon name="sort" size="x-small" style={{ transform: 'rotate(180deg)' }} />}
                                                {header.column.getIsSorted() === 'desc' && <PIcon name="sort" size="x-small" />}
                                            </PFlex>
                                        </th>
                                    ))}
                                    <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {tenders.map(tender => (
                                <tr
                                    key={tender.id}
                                    onClick={() => setSelectedTender(tender)}
                                    style={{ borderBottom: '1px solid #eee', cursor: 'pointer', transition: 'background 0.2s' }}
                                    className="hover:bg-slate-50"
                                >
                                    {table.getRowModel().rows.find(r => r.original.id === tender.id)?.getVisibleCells().map(cell => (
                                        <td key={cell.id} style={{ padding: '16px', verticalAlign: 'top' }}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                    <td style={{ padding: '16px', textAlign: 'right', verticalAlign: 'top' }}>
                                        <PButton
                                            variant="secondary"
                                            icon="arrow-right"
                                            onClick={(e) => { e.stopPropagation(); window.open(tender.url, '_blank'); }}
                                        >
                                            Origin
                                        </PButton>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div ref={observerTarget} style={{ padding: '32px', textAlign: 'center' }}>
                        {loading && <PSpinner />}
                        {!hasMore && tenders.length > 0 && <PText color="contrast-low">--- End of results ---</PText>}
                    </div>
                </div>
            </PFlex>

            {/* Detail Drawer */}
            <TenderDetailDrawer
                tender={selectedTender}
                isOpen={!!selectedTender}
                onClose={() => setSelectedTender(null)}
            />
        </div>
    );
};

export default CrawlingAnalysisView;
