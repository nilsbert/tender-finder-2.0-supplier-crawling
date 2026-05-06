import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {PHeading,
    PText,
    PFlex,
    PSpinner,
    PDivider,
    
    PButton,
    PSelectWrapper,
    PCheckboxWrapper,
    PModal,
    PTextFieldWrapper} from '@porsche-design-system/components-react';
import { StandardPageHeader } from '../../components/StandardPageHeader';
import type { SortingState } from '@tanstack/react-table';
import { api as crawlerApi } from './api';
import { useSavedViews, type SavedView } from '../../hooks/useSavedViews';
import { GenericTenderFilter, type WebsiteOption } from '../../components/GenericTenderFilter';
import { GenericTenderTable, type TenderColumn } from '../../components/GenericTenderTable';
import { useURLState } from '../../hooks/useURLState';
import { ContextFilters } from '../dashboard/components/ContextFilters';

const SourcingWorkbenchView = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { views, saveView, deleteView, error: storageError } = useSavedViews();

    // 1. Core Filter State
    const [searchText, setSearchText] = useURLState('search', '');
    const [selectedWebsite, setSelectedWebsite] = useURLState('website', '');
    const [officeIds, setOfficeIds] = useURLState('offices', [] as string[]);
    const [sectorIds, setSectorIds] = useURLState('sectors', [] as string[]);
    const [serviceIds, setServiceIds] = useURLState('services', [] as string[]);
    const [filterBy, setFilterBy] = useURLState('filterBy', 'published');
    const [dateMode, setDateMode] = useState<'single' | 'range'>('single');
    const [statusFilter, setStatusFilter] = useURLState('ai_status', 'open');

    const getLocalDateString = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const today = getLocalDateString(new Date());
    const [selectedDate, setSelectedDate] = useURLState('date', today);
    const [rangeStart, setRangeStart] = useURLState('start', '');
    const [rangeEnd, setRangeEnd] = useURLState('end', '');

    // 2. Workbench State
    const [visibleColumns, setVisibleColumns] = useState<TenderColumn[]>(['published', 'website', 'headline', 'rating_total', 'due', 'actions']);
    const [selectedViewId, setSelectedViewId] = useState<string>('default-today');
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [newViewName, setNewViewName] = useState('');

    // 3. Data State
    const [tenders, setTenders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const [sorting, setSorting] = useState<SortingState>([]);
    const LIMIT = 50;

    const websites: WebsiteOption[] = [
        { label: 'All Sources', value: '' },
        { label: 'TED Europe', value: 'TED Europe', type: 'portal' },
        { label: 'Austria USP', value: 'Austria USP', type: 'portal' },
        { label: 'Bund.de', value: 'Bund.de', type: 'portal' },
        { label: 'SIMAP', value: 'SIMAP', type: 'portal' },
        { label: 'Tender24', value: 'Tender24', type: 'company' },
        { label: 'e-Vergabe', value: 'e-Vergabe', type: 'portal' },
        { label: 'Öffentliche Vergabe', value: 'Öffentliche Vergabe', type: 'portal' },
        { label: 'TK Vergabe', value: 'TK Vergabe', type: 'company' },
        { label: 'DB Vergabe', value: 'DB Vergabe', type: 'company' },
        { label: 'Ausschreibungen Deutschland', value: 'Ausschreibungen Deutschland', type: 'portal' },
    ];

    const allColumnOptions: { id: TenderColumn, label: string }[] = [
        { id: 'published', label: 'Published Date' },
        { id: 'website', label: 'Source System' },
        { id: 'headline', label: 'Title & Summary' },
        { id: 'rating_total', label: 'Strategic Match' },
        { id: 'due', label: 'Deadline' },
        { id: 'est_volume', label: 'Est. Revenue' },
        { id: 'nearest_office', label: 'Nearest Office' },
        { id: 'enriched_date', label: 'Enrichment Date' },
        { id: 'pdfs', label: 'Documents' },
        { id: 'actions', label: 'Actions' },
    ];

    // 4. Fetching Logic
    const fetchData = async (isNewSearch = false) => {
        setLoading(true);
        const currentOffset = isNewSearch ? 0 : offset;

        let since = undefined;
        let until = undefined;
        if (dateMode === 'single' && selectedDate) {
            since = `${selectedDate}T00:00:00`;
            until = `${selectedDate}T23:59:59`;
        } else if (rangeStart && rangeEnd) {
            since = `${rangeStart}T00:00:00`;
            until = `${rangeEnd}T23:59:59`;
        }

        const params: any = {
            search: searchText || undefined,
            website: selectedWebsite || undefined,
            limit: LIMIT,
            offset: currentOffset,
            sort_by: sorting[0]?.id || 'rating_total',
            sort_dir: sorting[0]?.desc ? 'desc' : 'asc',
            office_ids: officeIds.length > 0 ? officeIds : undefined,
            sector_ids: sectorIds.length > 0 ? sectorIds : undefined,
            service_ids: serviceIds.length > 0 ? serviceIds : undefined,
            ai_status: statusFilter
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

        try {
            const data = await crawlerApi.searchTenders(params);
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

    useEffect(() => {
        const handler = setTimeout(() => fetchData(true), 300);
        return () => clearTimeout(handler);
    }, [searchText, selectedWebsite, officeIds, sectorIds, serviceIds, filterBy, dateMode, selectedDate, rangeStart, rangeEnd, sorting, statusFilter]);

    // 5. View Management
    const handleViewChange = (viewId: string) => {
        setSelectedViewId(viewId);
        const view = views.find(v => v.id === viewId);
        if (view) {
            setSearchText(view.search);
            if (view.website) setSelectedWebsite(view.website);
            if (view.office_ids) setOfficeIds(view.office_ids);
            if (view.sector_ids) setSectorIds(view.sector_ids);
            if (view.service_ids) setServiceIds(view.service_ids);
            if (view.columns) setVisibleColumns(view.columns as TenderColumn[]);
        }
    };

    const handleSaveView = () => {
        if (!newViewName) return;
        saveView({
            name: newViewName,
            search: searchText,
            website: selectedWebsite,
            office_ids: officeIds,
            sector_ids: sectorIds,
            service_ids: serviceIds,
            columns: visibleColumns,
            published_min: filterBy === 'published' ? selectedDate : undefined
        });
        setNewViewName('');
        setIsSaveModalOpen(false);
    };

    const toggleColumn = (colId: TenderColumn) => {
        setVisibleColumns(prev =>
            prev.includes(colId) ? prev.filter(c => c !== colId) : [...prev, colId]
        );
    };

    return (
        <div className="p-content-wrapper">
            <div style={{ padding: '0 24px' }}>
                <PFlex direction="column" style={{ gap: '24px', marginTop: '24px' }}>
                    <StandardPageHeader
                        title="Sourcing Workbench"
                        subtitle="Central workspace for high-speed tender discovery and evaluation."
                    >
                        <PFlex direction="column" style={{ gap: '24px', width: '100%' }}>
                            {/* Saved Views Row */}
                            <PFlex style={{ gap: '16px' }} alignItems="flex-end">
                                <div style={{ width: '300px' }}>
                                    <PSelectWrapper label="Active View">
                                        <select
                                            value={selectedViewId}
                                            onChange={e => handleViewChange(e.target.value)}
                                            style={{ backgroundColor: 'var(--p-surface-background-default)' }}
                                        >
                                            {views.map(v => (
                                                <option key={v.id} value={v.id}>{v.name}</option>
                                            ))}
                                        </select>
                                    </PSelectWrapper>
                                </div>
                                <PButton variant="secondary" icon="save" onClick={() => setIsSaveModalOpen(true)}>Save as View</PButton>
                                {selectedViewId !== 'default-today' && (
                                    <PButton variant="tertiary" icon="delete" onClick={() => deleteView(selectedViewId)}>Delete</PButton>
                                )}

                                <div style={{ flex: 1 }} />

                                {/* Column Toggle Popover (simulated with a simple flex for now) */}
                                <PFlex style={{ gap: '8px', opacity: 0.8 }} alignItems="center">
                                    <PText size="x-small" weight="bold">Show Columns:</PText>
                                    {allColumnOptions.filter(col => col.id !== 'headline' && col.id !== 'actions').map(col => (
                                        <PCheckboxWrapper key={col.id} label={col.label} hideLabel>
                                            <input
                                                type="checkbox"
                                                checked={visibleColumns.includes(col.id)}
                                                onChange={() => toggleColumn(col.id)}
                                            />
                                        </PCheckboxWrapper>
                                    ))}
                                </PFlex>
                            </PFlex>

                            <PDivider />

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
                                    setOfficeIds([]);
                                    setSectorIds([]);
                                    setServiceIds([]);
                                    setSelectedDate(today);
                                    setFilterBy('published');
                                    setVisibleColumns(['published', 'website', 'headline', 'rating_total', 'due', 'actions']);
                                    setStatusFilter('open');
                                }}
                            />

                            <PDivider />

                            <div style={{ padding: '0 8px' }}>
                                <ContextFilters
                                    officeIds={officeIds}
                                    setOfficeIds={setOfficeIds}
                                    sectorIds={sectorIds}
                                    setSectorIds={setSectorIds}
                                    serviceIds={serviceIds}
                                    setServiceIds={setServiceIds}
                                    sourceFilter={selectedWebsite === 'manual' ? 'manual' : (selectedWebsite === '' ? 'all' : 'crawled')}
                                    setSourceFilter={(val) => {
                                        if (val === 'manual') setSelectedWebsite('manual');
                                        else if (val === 'all') setSelectedWebsite('');
                                        else if (val === 'crawled' && selectedWebsite === 'manual') setSelectedWebsite('');
                                    }}
                                    statusFilter={statusFilter}
                                    setStatusFilter={setStatusFilter}
                                />
                            </div>
                        </PFlex>
                    </StandardPageHeader>

                    {storageError && (
                        <div style={{ backgroundColor: 'var(--p-notification-error-soft)', padding: '12px', borderRadius: '4px' }}>
                            <PText color="notification-error">{storageError}</PText>
                        </div>
                    )}

                    <GenericTenderTable
                        data={tenders}
                        loading={loading}
                        hasMore={hasMore}
                        onLoadMore={() => fetchData()}
                        onRowClick={(tender: any) => navigate(`/tenders/${tender.id}`)}
                        sorting={sorting}
                        onSortingChange={setSorting}
                        visibleColumns={visibleColumns}
                    />
                </PFlex>
            </div>

            <PModal
                open={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                aria={{ 'aria-label': 'Save Current View Modal' }}
            >
                <PHeading size="large" slot="header">Save Current View</PHeading>
                <PFlex direction="column" style={{ gap: '24px' }}>
                    <PText>Save your current filters and visible columns as a reusable view.</PText>
                    <PTextFieldWrapper label="View Name">
                        <input
                            type="text"
                            value={newViewName}
                            onChange={e => setNewViewName(e.target.value)}
                            placeholder="e.g., Solar Projects Germany"
                        />
                    </PTextFieldWrapper>
                    <PFlex justifyContent="flex-end" style={{ gap: '12px' }}>
                        <PButton variant="tertiary" onClick={() => setIsSaveModalOpen(false)}>Cancel</PButton>
                        <PButton onClick={handleSaveView}>Save View</PButton>
                    </PFlex>
                </PFlex>
            </PModal>
        </div>
    );
};

export default SourcingWorkbenchView;
