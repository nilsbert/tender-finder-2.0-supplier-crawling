import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {PFlex,
    
    PButton,
    PTextFieldWrapper} from '@porsche-design-system/components-react';
import { useURLState } from '../../hooks/useURLState';
import type { SortingState } from '@tanstack/react-table';
import { api as crawlerApi } from '../sourcing/api';
import { api as enrichingApi } from './api';
import { StandardPageHeader } from '../../components/StandardPageHeader';
import { GenericTenderFilter } from '../../components/GenericTenderFilter';
import { GenericTenderTable } from '../../components/GenericTenderTable';
import { TenderDetailDrawer } from '../../components/TenderDetailDrawer';
import type { Tender } from '../../components/GenericTenderTable.types';

interface EnrichmentDashboardViewProps {
    dbMode: 'disconnected' | 'cosmos';
}

const EnrichmentDashboardView: React.FC<EnrichmentDashboardViewProps> = ({ dbMode }) => {
    // Filter State
    const [searchText, setSearchText] = useURLState('search', '');
    const [selectedWebsite, setSelectedWebsite] = useURLState('website', '');

    // Get today's date in YYYY-MM-DD format
    const getTodayString = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const [enrichedDate, setEnrichedDate] = useURLState('enriched_date', getTodayString());
    const [officeFilter, setOfficeFilter] = useURLState('office', '');
    const [ratingMinStr, setRatingMinStr] = useURLState('rating_min', '');
    const ratingMin = ratingMinStr ? parseFloat(ratingMinStr) : null;

    // Data State
    const [tenders, setTenders] = useState<Tender[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const LIMIT = 50;

    // Table State
    const [sorting, setSorting] = useState<SortingState>([{ id: 'enriched_date', desc: true }]);
    const [selectedTender, setSelectedTender] = useState<Tender | null>(null);

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
    ];

    const officeOptions = [
        { label: 'All Offices', value: '' },
        { label: 'Ludwigsburg', value: 'Ludwigsburg' },
        { label: 'Stuttgart', value: 'Stuttgart' },
        { label: 'Berlin', value: 'Berlin' },
        { label: 'Essen', value: 'Essen' },
        { label: 'Frankfurt', value: 'Frankfurt' },
        { label: 'Ingolstadt', value: 'Ingolstadt' },
        { label: 'München', value: 'München' },
        { label: 'Nürnberg', value: 'Nürnberg' },
        { label: 'Wolfsburg', value: 'Wolfsburg' },
        { label: 'Hamburg', value: 'Hamburg' },
        { label: 'Wien', value: 'Wien' },
        { label: 'Zürich', value: 'Zürich' }
    ];

    const fetchTenders = useCallback(async (isNewSearch = false) => {
        if (dbMode === 'disconnected' || loading) return;

        setLoading(true);
        const currentOffset = isNewSearch ? 0 : offset;

        try {
            const data = await crawlerApi.searchTenders({
                search: searchText || undefined,
                website: selectedWebsite || undefined,
                limit: LIMIT,
                offset: currentOffset,
                rating_min: ratingMin ?? undefined,
                sort_by: sorting[0]?.id || 'enriched_date',
                sort_dir: sorting[0]?.desc ? 'desc' : 'asc',
                enriched_date: enrichedDate || undefined
            });

            // Local filter for office if not supported by API yet
            let filteredData = data;
            if (officeFilter) {
                filteredData = data.filter((t: any) => t.enrichment?.nearest_office === officeFilter);
            }

            if (isNewSearch) {
                setTenders(filteredData);
                setOffset(LIMIT);
            } else {
                setTenders(prev => [...prev, ...filteredData]);
                setOffset(prev => prev + LIMIT);
            }

            setHasMore(data.length === LIMIT);
        } catch (error) {
            console.error("Failed to fetch tenders", error);
        } finally {
            setLoading(false);
        }
    }, [dbMode, loading, offset, searchText, selectedWebsite, officeFilter, ratingMin, sorting, enrichedDate]);



    // Initial fetch and filter changes
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchTenders(true);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchText, selectedWebsite, officeFilter, ratingMin, sorting, enrichedDate, dbMode]);

    // Date navigation handlers
    const handlePrevDate = () => {
        const currentDate = new Date(enrichedDate);
        currentDate.setDate(currentDate.getDate() - 1);
        setEnrichedDate(currentDate.toISOString().split('T')[0]);
    };

    const handleNextDate = () => {
        const currentDate = new Date(enrichedDate);
        currentDate.setDate(currentDate.getDate() + 1);
        setEnrichedDate(currentDate.toISOString().split('T')[0]);
    };

    const handleToday = () => {
        setEnrichedDate(getTodayString());
    };

    return (
        <div className="p-content-wrapper">
            <div style={{ padding: '0 24px' }}>
                <PFlex direction="column" style={{ gap: '24px', marginTop: '24px' }}>
                    <StandardPageHeader
                        title="Analysis Console"
                        subtitle="Review and analyze AI-enriched tenders with detailed summaries and insights."
                    >
                        <PFlex direction="column" style={{ gap: '16px', width: '100%' }}>
                            {/* Row 1: Global Search */}
                            <div style={{ width: '100%' }}>
                                <GenericTenderFilter
                                    variant="rating"
                                    searchText={searchText}
                                    onSearchChange={setSearchText}
                                    searchPlaceholder="Search enriched tenders..."
                                    selectedWebsite={selectedWebsite}
                                    onWebsiteChange={setSelectedWebsite}
                                    websites={websites}
                                    selectedOffice={officeFilter}
                                    onOfficeChange={setOfficeFilter}
                                    offices={officeOptions}
                                    ratingMin={ratingMin}
                                    onRatingMinChange={(val) => setRatingMinStr(val !== null ? val.toString() : '')}
                                />
                            </div>

                            {/* Row 2: Enriched Date Picker */}
                            <PFlex style={{ gap: '12px' }} alignItems="center">
                                <PButton
                                    variant="secondary"
                                    icon="arrow-head-left"
                                    hideLabel
                                    onClick={handlePrevDate}
                                >
                                    Prev
                                </PButton>
                                <div style={{ width: '200px' }}>
                                    <PTextFieldWrapper label="Selected Day" hideLabel>
                                        <input
                                            type="date"
                                            value={enrichedDate}
                                            onChange={(e) => setEnrichedDate(e.target.value)}
                                            style={{ fontSize: '14px', height: '42px', padding: '0 12px', border: '1px solid #ddd', borderRadius: '4px' }}
                                        />
                                    </PTextFieldWrapper>
                                </div>
                                <PButton
                                    variant="secondary"
                                    icon="arrow-head-right"
                                    hideLabel
                                    onClick={handleNextDate}
                                >
                                    Next
                                </PButton>
                                <PButton variant="tertiary" onClick={handleToday}>
                                    Today
                                </PButton>
                            </PFlex>
                        </PFlex>
                    </StandardPageHeader>

                    <GenericTenderTable
                        data={tenders as any}
                        loading={loading}
                        hasMore={hasMore}
                        onLoadMore={() => fetchTenders()}
                        onRowClick={(tender: any) => setSelectedTender(tender)}
                        sorting={sorting}
                        onSortingChange={setSorting}
                        visibleColumns={['enriched_date', 'headline', 'rating_total', 'nearest_office', 'due', 'actions']}
                    />
                </PFlex>

                <TenderDetailDrawer
                    tender={selectedTender}
                    isOpen={!!selectedTender}
                    onClose={() => setSelectedTender(null)}
                />
            </div>
        </div>
    );
};

export default EnrichmentDashboardView;
