import React from 'react';
import { useTranslation } from 'react-i18next';
import {PButton,
    PTextFieldWrapper,
    PSelectWrapper,
    PIcon,
    PText} from '@porsche-design-system/components-react';

export interface WebsiteOption {
    label: string;
    value: string;
    type?: 'portal' | 'company';
}

interface GenericTenderFilterProps {
    variant: 'crawling' | 'rating';

    // Core Search
    searchText: string;
    onSearchChange: (val: string) => void;
    searchPlaceholder?: string;

    // Source filtering
    selectedWebsite: string;
    onWebsiteChange: (val: string) => void;
    websites: WebsiteOption[];

    // Office filtering (for enrichment console)
    selectedOffice?: string;
    onOfficeChange?: (val: string) => void;
    offices?: WebsiteOption[];

    // Date filtering (Variant: crawling)
    filterBy?: 'crawl' | 'published' | 'enriched';
    onFilterByChange?: (val: 'crawl' | 'published' | 'enriched') => void;
    dateMode?: 'single' | 'range';
    onDateModeChange?: (val: 'single' | 'range') => void;
    selectedDate?: string;
    onSelectedDateChange?: (val: string) => void;
    rangeStart?: string;
    onRangeStartChange?: (val: string) => void;
    rangeEnd?: string;
    onRangeEndChange?: (val: string) => void;

    // Time presets (Variant: rating)
    timePreset?: string;
    onTimePresetChange?: (val: string) => void;

    // Rating filtering (Variant: rating)
    ratingMin?: number | null;
    onRatingMinChange?: (val: number | null) => void;
    ratingMax?: number | null;
    onRatingMaxChange?: (val: number | null) => void;

    // Metadata filtering (Variant: rating)
    typeFilter?: string;
    onTypeChange?: (val: string) => void;
    subTypeFilter?: string;
    onSubTypeChange?: (val: string) => void;
    categories?: string[];
    keywordTree?: Record<string, string[]>;

    // Actions
    onResetFilters?: () => void;
    extraActions?: React.ReactNode;
}

export const GenericTenderFilter: React.FC<GenericTenderFilterProps> = (props) => {
    const { t } = useTranslation();
    const {
        variant,
        searchText, onSearchChange, searchPlaceholder,
        selectedWebsite, onWebsiteChange, websites,
        onResetFilters, extraActions
    } = props;

    // Always include an "All Sources" option; caller-provided websites should come from the database.
    // Group websites into Portals and Companies
    const { portals, companies, allOption } = React.useMemo(() => {
        const hasAll = websites.some(w => w.value === '');
        const all = hasAll ? websites.find(w => w.value === '')! : { label: t('analysis.filter.all_sources'), value: '' };

        const others = websites.filter(w => w.value !== '');

        // Manual classification fallback if type is missing
        const classified = others.map(w => {
            if (w.type) return w;
            const lower = w.label.toLowerCase();
            const isCompany = lower.includes('bahn') || lower.includes('tk') || lower.includes('deutsche');
            return { ...w, type: isCompany ? 'company' : 'portal' } as WebsiteOption;
        });

        return {
            allOption: all,
            portals: classified.filter(w => w.type !== 'company'),
            companies: classified.filter(w => w.type === 'company')
        };
    }, [websites, t]);

    const {
        filterBy, onFilterByChange,
        dateMode, onDateModeChange,
        selectedDate, onSelectedDateChange,
        rangeStart, onRangeStartChange,
        rangeEnd, onRangeEndChange
    } = props;

    const handlePrev = () => {
        if (dateMode === 'single' && selectedDate && onSelectedDateChange) {
            const d = new Date(selectedDate);
            d.setDate(d.getDate() - 1);
            onSelectedDateChange(d.toISOString().split('T')[0]);
        }
    };

    const handleNext = () => {
        if (dateMode === 'single' && selectedDate && onSelectedDateChange) {
            const d = new Date(selectedDate);
            d.setDate(d.getDate() + 1);
            onSelectedDateChange(d.toISOString().split('T')[0]);
        }
    };

    const handleToday = () => {
        const today = new Date().toISOString().split('T')[0];
        if (dateMode === 'single' && onSelectedDateChange) {
            onSelectedDateChange(today);
        }
    };

    const DateLogicRow = (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ background: '#f5f5f5', borderRadius: '4px', padding: '2px', display: 'flex' }}>
                <PButton
                    variant={dateMode === 'single' ? 'primary' : 'tertiary'}
                    onClick={() => onDateModeChange?.('single')}
                >
                    {t('analysis.filter.single_day')}
                </PButton>
                <PButton
                    variant={dateMode === 'range' ? 'primary' : 'tertiary'}
                    onClick={() => onDateModeChange?.('range')}
                >
                    {t('analysis.filter.date_range')}
                </PButton>
            </div>

            <div style={{ background: '#f5f5f5', borderRadius: '4px', padding: '2px', display: 'flex' }}>
                <PButton
                    variant={filterBy === 'crawl' ? 'primary' : 'tertiary'}
                    onClick={() => onFilterByChange?.('crawl')}
                >
                    {t('analysis.filter.crawl_date')}
                </PButton>
                <PButton
                    variant={filterBy === 'published' ? 'primary' : 'tertiary'}
                    onClick={() => onFilterByChange?.('published')}
                >
                    {t('analysis.filter.published_date')}
                </PButton>
                <PButton
                    variant={filterBy === 'enriched' ? 'primary' : 'tertiary'}
                    onClick={() => onFilterByChange?.('enriched')}
                >
                    {t('analysis.filter.enriched_date')}
                </PButton>
            </div>
        </div>
    );

    const DatePickerRow = ((dateMode === 'single' && selectedDate) || (dateMode === 'range' && (rangeStart || rangeEnd))) && (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {dateMode === 'single' ? (
                <>
                    <PButton variant="secondary" icon="arrow-head-left" onClick={handlePrev} hideLabel>{t('analysis.filter.prev')}</PButton>
                    <div style={{ width: '200px' }}>
                        <PTextFieldWrapper label={t('analysis.filter.selected_day')} hideLabel>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => onSelectedDateChange?.(e.target.value)}
                                style={{ fontSize: '14px', height: '42px', padding: '0 12px', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                        </PTextFieldWrapper>
                    </div>
                    <PButton variant="secondary" icon="arrow-head-right" onClick={handleNext} hideLabel>{t('analysis.filter.next')}</PButton>
                    <PButton variant="tertiary" onClick={handleToday}>{t('analysis.filter.today')}</PButton>
                </>
            ) : (
                <>
                    <div style={{ width: '180px' }}>
                        <PTextFieldWrapper label={t('analysis.filter.start_date')} hideLabel>
                            <input
                                type="date"
                                value={rangeStart}
                                onChange={(e) => onRangeStartChange?.(e.target.value)}
                                style={{ fontSize: '14px', height: '42px', padding: '0 12px', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                        </PTextFieldWrapper>
                    </div>
                    <PText weight="bold">→</PText>
                    <div style={{ width: '180px' }}>
                        <PTextFieldWrapper label={t('analysis.filter.end_date')} hideLabel>
                            <input
                                type="date"
                                value={rangeEnd}
                                onChange={(e) => onRangeEndChange?.(e.target.value)}
                                style={{ fontSize: '14px', height: '42px', padding: '0 12px', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                        </PTextFieldWrapper>
                    </div>
                </>
            )}
        </div>
    );

    // --- CRAWLING VARIANT ---
    if (variant === 'crawling') {

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                {/* Row 1: Global Search */}
                <div style={{ width: '100%' }}>
                    <PTextFieldWrapper label={t('analysis.filter.search_label')} description={t('analysis.filter.search_placeholder')} hideLabel>
                        <PIcon name="search" style={{ position: 'absolute', left: '12px', top: '12px', zIndex: 1 }} color="contrast-low" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder || t('analysis.filter.search_placeholder')}
                            value={searchText}
                            onChange={(e) => onSearchChange(e.target.value)}
                            style={{ paddingLeft: '40px', fontSize: '15px', height: '48px', width: '100%', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </PTextFieldWrapper>
                </div>

                {/* Row 2: Logical Toggles */}
                {DateLogicRow}

                {/* Row 3: Date Pickers & Navigation */}
                {DatePickerRow}

                {/* Row 4: Source Row */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '240px' }}>
                        <PSelectWrapper label={t('analysis.filter.source_label')} hideLabel>
                            <select
                                value={selectedWebsite}
                                onChange={(e) => onWebsiteChange(e.target.value)}
                                style={{ fontSize: '14px', height: '42px', padding: '0 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
                            >
                                <option value={allOption.value}>{allOption.label}</option>
                                <optgroup label={t('analysis.filter.portals') || 'Portals'}>
                                    {portals.map((w) => (
                                        <option key={w.value} value={w.value}>{w.label}</option>
                                    ))}
                                </optgroup>
                                <optgroup label={t('analysis.filter.companies') || 'Companies'}>
                                    {companies.map((w) => (
                                        <option key={w.value} value={w.value}>{w.label}</option>
                                    ))}
                                </optgroup>
                            </select>
                        </PSelectWrapper>
                    </div>
                </div>
            </div>
        );
    }

    // --- RATING VARIANT ---
    const {
        ratingMin, onRatingMinChange,
        typeFilter, onTypeChange,
        subTypeFilter, onSubTypeChange,
        categories = [],
        keywordTree,
        selectedOffice, onOfficeChange, offices
    } = props;

    const hasHeaderActions = extraActions || onResetFilters;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            {/* Top Row: Actions */}
            {hasHeaderActions && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {extraActions}
                    </div>
                    {onResetFilters && (
                        <PButton variant="tertiary" icon="reset" onClick={onResetFilters}>{t('analysis.filter.reset')}</PButton>
                    )}
                </div>
            )}

            {/* Row 2: Global Search */}
            <div style={{ width: '100%' }}>
                <PTextFieldWrapper label={t('analysis.filter.search_label')} description={t('analysis.filter.search_placeholder')} hideLabel>
                    <PIcon name="search" style={{ position: 'absolute', left: '12px', top: '12px', zIndex: 1 }} color="contrast-low" />
                    <input
                        type="text"
                        placeholder={t('analysis.filter.search_placeholder')}
                        value={searchText}
                        onChange={(e) => onSearchChange(e.target.value)}
                        style={{ paddingLeft: '40px', fontSize: '15px', height: '48px', width: '100%', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </PTextFieldWrapper>
            </div>

            {/* Row 3: Logic Toggles */}
            {DateLogicRow}

            {/* Row 4: Date Pickers */}
            {DatePickerRow}

            {/* Row 5: Granular Filters */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '240px' }}>
                    <PSelectWrapper label={t('analysis.filter.source_label')} hideLabel>
                        <select
                            value={selectedWebsite}
                            onChange={(e) => onWebsiteChange(e.target.value)}
                            style={{ fontSize: '14px', height: '42px', padding: '0 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
                        >
                            <option value={allOption.value}>{allOption.label}</option>
                            <optgroup label={t('analysis.filter.portals') || 'Portals'}>
                                {portals.map((w) => (
                                    <option key={w.value} value={w.value}>{w.label}</option>
                                ))}
                            </optgroup>
                            <optgroup label={t('analysis.filter.companies') || 'Companies'}>
                                {companies.map((w) => (
                                    <option key={w.value} value={w.value}>{w.label}</option>
                                ))}
                            </optgroup>
                        </select>
                    </PSelectWrapper>
                </div>

                {selectedOffice !== undefined && onOfficeChange && offices && (
                    <div style={{ width: '180px' }}>
                        <PSelectWrapper label={t('analysis.filter.office_label')} hideLabel>
                            <select
                                value={selectedOffice}
                                onChange={(e) => onOfficeChange(e.target.value)}
                                style={{ fontSize: '14px', height: '42px', padding: '0 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
                            >
                                {offices.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </PSelectWrapper>
                    </div>
                )}

                <div style={{ flex: 1 }} />

                <div style={{ width: '130px' }}>
                    <PSelectWrapper label={t('analysis.filter.min_score')} hideLabel>
                        <select
                            value={ratingMin ?? ''}
                            onChange={e => onRatingMinChange?.(e.target.value ? parseFloat(e.target.value) : null)}
                        >
                            <option value="">{t('analysis.filter.any_score')}</option>
                            <option value="0">{t('analysis.filter.score_positive')}</option>
                            <option value="20">{t('analysis.filter.score_strategic')}</option>
                            <option value="50">{t('analysis.filter.score_high_value')}</option>
                        </select>
                    </PSelectWrapper>
                </div>

                <div style={{ width: '120px' }}>
                    <PSelectWrapper label={t('analysis.filter.type_label')} hideLabel>
                        <select
                            value={typeFilter}
                            onChange={e => onTypeChange?.(e.target.value)}
                        >
                            <option value="">{t('analysis.filter.all_types')}</option>
                            <option value="Service">{t('analysis.filter.type_service')}</option>
                            <option value="Sector">{t('analysis.filter.type_sector')}</option>
                        </select>
                    </PSelectWrapper>
                </div>

                <div style={{ width: '160px' }}>
                    <PSelectWrapper label={t('analysis.filter.subtype_label')} hideLabel>
                        <select
                            value={subTypeFilter}
                            onChange={e => onSubTypeChange?.(e.target.value)}
                        >
                            <option value="">{t('analysis.filter.all_subtypes')}</option>
                            {keywordTree ? (
                                Object.entries(keywordTree).sort(([a], [b]) => {
                                    if (a === 'Service') return -1;
                                    if (b === 'Service') return 1;
                                    if (a === 'Sector') return -1;
                                    if (b === 'Sector') return 1;
                                    return a.localeCompare(b);
                                }).map(([type, subtypes]) => (
                                    <optgroup
                                        key={type}
                                        label={
                                            type === 'Service' ? t('analysis.filter.type_service') :
                                                type === 'Sector' ? t('analysis.filter.type_sector') :
                                                    type
                                        }
                                    >
                                        {subtypes.filter(st => st !== 'Unassigned').map(subtype => (
                                            <option key={`${type}-${subtype}`} value={subtype}>
                                                {subtype}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))
                            ) : (
                                categories.map(c => <option key={c} value={c}>{c}</option>)
                            )}
                        </select>
                    </PSelectWrapper>
                </div>
            </div>
        </div>
    );
};
