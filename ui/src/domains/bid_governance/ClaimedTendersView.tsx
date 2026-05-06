import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {PFlex,
    PFlexItem,
    PHeading,
    PText,
    PTag,
    PSpinner} from '@porsche-design-system/components-react';
import { GlobalFilterHeader, type FilterValues } from '../../components/GlobalFilterHeader';
import { TenderDetailDrawer } from '../../components/TenderDetailDrawer';
import { bidGovernanceApi } from './api';

interface Tender {
    id: string;
    internal_id: string;
    external_id: string;
    headline: string;
    description: string;
    caller: string;
    published: string;
    due?: string;
    name_website: string;
    url: string;
    tender_type?: string;
    cpv_codes?: string[];
    location?: string;
    rating_total?: number;
    rating_by_category?: Record<string, number>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    matched_keywords?: any[];
}

const ClaimedTendersView: React.FC = () => {
    const [tenders, setTenders] = useState<Tender[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedWebsite, setSelectedWebsite] = useState('');
    const [crawledSince, setCrawledSince] = useState('');
    const [dueUntil, setDueUntil] = useState('');
    const [page, setPage] = useState(0);
    const [limit] = useState(50);
    const [hasMore, setHasMore] = useState(true);
    const observerTarget = useRef<HTMLDivElement>(null);
    const [filteredCount, setFilteredCount] = useState(0);

    const [hoveredTender, setHoveredTender] = useState<Tender | null>(null);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const [sortColumn, setSortColumn] = useState<'published' | 'due' | 'website' | 'headline' | 'location' | 'rating' | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const currentFilters: FilterValues = {
        searchText,
        selectedWebsite,
        crawledSince,
        dueUntil,
    };

    const handleFilterChange = (filters: FilterValues) => {
        setSearchText(filters.searchText);
        setSelectedWebsite(filters.selectedWebsite);
        setCrawledSince(filters.crawledSince);
        setDueUntil(filters.dueUntil);
    };

    const handleTenderClick = (tender: Tender) => {
        setSelectedTender(tender);
        setIsDrawerOpen(true);
    };

    const fetchTenders = useCallback(async (reset = false) => {
        setLoading(true);
        try {
            const currentOffset = reset ? 0 : page * limit;

            let crawledSinceDate: string | undefined = undefined;
            if (crawledSince) {
                const now = new Date();
                if (crawledSince === '24h') {
                    now.setHours(now.getHours() - 24);
                } else if (crawledSince === '7d') {
                    now.setDate(now.getDate() - 7);
                } else if (crawledSince === '30d') {
                    now.setDate(now.getDate() - 30);
                }
                crawledSinceDate = now.toISOString();
            }

            let dueUntilDate: string | undefined = undefined;
            if (dueUntil) {
                const now = new Date();
                if (dueUntil === '7d') {
                    now.setDate(now.getDate() + 7);
                } else if (dueUntil === '30d') {
                    now.setDate(now.getDate() + 30);
                } else if (dueUntil === '90d') {
                    now.setDate(now.getDate() + 90);
                }
                dueUntilDate = now.toISOString();
            }

            const data = await bidGovernanceApi.listClaimedTenders({
                search: searchText,
                website: selectedWebsite,
                limit,
                offset: currentOffset,
                crawled_since: crawledSinceDate,
                due_until: dueUntilDate,
            });

            if (reset) {
                setTenders(data);
                setPage(1);
                if (data.length < limit) {
                    setFilteredCount(data.length);
                } else {
                    setFilteredCount(-1);
                }
            } else {
                const newTenders = [...tenders, ...data];
                setTenders(newTenders);
                setPage(prev => prev + 1);
                if (data.length < limit) {
                    setFilteredCount(newTenders.length);
                }
            }

            setHasMore(data.length === limit);
        } catch (error) {
            console.error('Failed to fetch claimed tenders:', error);
        } finally {
            setLoading(false);
        }
    }, [searchText, selectedWebsite, page, limit, crawledSince, dueUntil, tenders]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    fetchTenders(false);
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [hasMore, loading, fetchTenders]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTenders(true);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchText, selectedWebsite, crawledSince, dueUntil, fetchTenders]);

    const handleSort = (column: 'published' | 'due' | 'website' | 'headline' | 'location' | 'rating') => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('desc');
        }
    };

    const sortedTenders = useMemo(() => {
        if (!sortColumn) return tenders;

        return [...tenders].sort((a, b) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let aValue: any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let bValue: any;

            switch (sortColumn) {
                case 'published':
                    aValue = a.published ? new Date(a.published).getTime() : 0;
                    bValue = b.published ? new Date(b.published).getTime() : 0;
                    break;
                case 'due':
                    aValue = a.due ? new Date(a.due).getTime() : 0;
                    bValue = b.due ? new Date(b.due).getTime() : 0;
                    break;
                case 'website':
                    aValue = a.name_website || '';
                    bValue = b.name_website || '';
                    break;
                case 'headline':
                    aValue = a.headline || '';
                    bValue = b.headline || '';
                    break;
                case 'location':
                    aValue = a.location || '';
                    bValue = b.location || '';
                    break;
                case 'rating':
                    aValue = a.rating_total || 0;
                    bValue = b.rating_total || 0;
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [tenders, sortColumn, sortDirection]);

    const handleMouseEnter = (tender: Tender, e: React.MouseEvent) => {
        setHoveredTender(tender);
        setCursorPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        setCursorPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseLeave = () => {
        setHoveredTender(null);
    };

    return (
        <div className="p-content-wrapper">
            <PFlex direction="column" style={{ gap: '24px' }}>
                <PFlexItem>
                    <PFlex justifyContent="space-between" alignItems="center">
                        <PHeading size="large">Claimed Tenders</PHeading>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <PTag color="notification-warning">
                                Results: {filteredCount === -1 ? `${tenders.length}+` : filteredCount}
                            </PTag>
                        </div>
                    </PFlex>
                </PFlexItem>

                <PFlexItem>
                    <GlobalFilterHeader
                        filters={currentFilters}
                        onFilterChange={handleFilterChange}
                    />
                </PFlexItem>

                <PFlexItem>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '4px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        overflowX: 'auto'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                                <tr>
                                    <th
                                        style={{ padding: '12px 16px', textAlign: 'left', cursor: 'pointer', userSelect: 'none' }}
                                        onClick={() => handleSort('published')}
                                    >
                                        Published {sortColumn === 'published' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        style={{ padding: '12px 16px', textAlign: 'left', cursor: 'pointer', userSelect: 'none' }}
                                        onClick={() => handleSort('due')}
                                    >
                                        Due {sortColumn === 'due' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        style={{ padding: '12px 16px', textAlign: 'left', cursor: 'pointer', userSelect: 'none' }}
                                        onClick={() => handleSort('website')}
                                    >
                                        Website {sortColumn === 'website' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        style={{ padding: '12px 16px', textAlign: 'left', cursor: 'pointer', userSelect: 'none' }}
                                        onClick={() => handleSort('headline')}
                                    >
                                        Headline / Caller / Rating {sortColumn === 'headline' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        style={{ padding: '12px 16px', textAlign: 'left', cursor: 'pointer', userSelect: 'none' }}
                                        onClick={() => handleSort('location')}
                                    >
                                        Location {sortColumn === 'location' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tenders.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
                                            No claimed tenders found.
                                        </td>
                                    </tr>
                                )}
                                {sortedTenders.map((tender) => (
                                    <tr
                                        key={tender.id}
                                        style={{ borderBottom: '1px solid #eee', cursor: 'pointer' }} onClick={() => handleTenderClick(tender)}
                                        onMouseEnter={(e) => handleMouseEnter(tender, e)}
                                        onMouseMove={handleMouseMove}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                                            {tender.published ? new Date(tender.published).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                                            {tender.due ? new Date(tender.due).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                                            <PTag color="background-base">{tender.name_website}</PTag>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                                {tender.headline || 'No Headline'}
                                            </div>
                                            <div style={{ color: '#666', fontSize: '13px', marginBottom: '8px' }}>
                                                {tender.caller || 'Unknown Caller'}
                                            </div>

                                            {tender.description && (
                                                <div style={{
                                                    marginBottom: '8px',
                                                    fontSize: '12px',
                                                    color: '#888',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}>
                                                    {tender.description}
                                                </div>
                                            )}

                                            {(tender.rating_total !== undefined || (tender.rating_by_category && Object.keys(tender.rating_by_category).length > 0)) && (
                                                <div style={{ backgroundColor: '#f9f9f9', padding: '8px', borderRadius: '4px' }}>
                                                    {tender.rating_total !== undefined && (
                                                        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px', color: tender.rating_total > 0 ? '#1b7e28' : tender.rating_total < 0 ? 'var(--tf-danger)' : '#333' }}>
                                                            Total Score: {tender.rating_total}
                                                        </div>
                                                    )}

                                                    {tender.rating_by_category && Object.keys(tender.rating_by_category).length > 0 && (
                                                        <div style={{ fontSize: '12px', color: '#555' }}>
                                                            <span style={{ fontWeight: '600' }}>Results by Category: </span>
                                                            {Object.entries(tender.rating_by_category).map(([category, score], idx) => (
                                                                <span key={category}>
                                                                    {idx > 0 && ', '}
                                                                    {category}: <strong>{score}</strong>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>{tender.location || '-'}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            {tender.url && (
                                                <a
                                                    href={tender.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: 'var(--tf-accent)', textDecoration: 'none', fontWeight: 'bold' }}
                                                >
                                                    Link to Origin
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </PFlexItem>

                {(hasMore || loading) && (
                    <PFlexItem style={{ textAlign: 'center', padding: '16px' }}>
                        <div ref={observerTarget} style={{ height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {loading && <PSpinner />}
                        </div>
                    </PFlexItem>
                )}
            </PFlex>

            {hoveredTender && (
                <div style={{
                    position: 'fixed',
                    top: Math.min(cursorPos.y + 20, window.innerHeight - 520),
                    left: Math.min(cursorPos.x + 20, window.innerWidth - 620),
                    width: '600px',
                    maxHeight: '500px',
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    padding: '16px',
                    zIndex: 1000,
                    overflowY: 'auto',
                    pointerEvents: 'none'
                }}>
                    <PHeading size="small">{hoveredTender.headline}</PHeading>
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                        <strong>Caller:</strong> {hoveredTender.caller}
                    </div>
                    <div style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}>
                        <strong>Due:</strong> {hoveredTender.due ? new Date(hoveredTender.due).toLocaleDateString() : 'N/A'}
                    </div>
                    <div style={{ marginTop: '12px', fontSize: '13px', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                        {hoveredTender.description}
                    </div>
                </div>
            )}

            <TenderDetailDrawer
                tender={selectedTender}
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
            />
        </div>
    );
};

export default ClaimedTendersView;
