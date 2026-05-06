import { type FC } from 'react';
import {PFlex,
    PFlexItem,
    PTextFieldWrapper,
    PSelectWrapper} from '@porsche-design-system/components-react';
import { featureFlags } from '../config/featureFlags';

export interface FilterValues {
    searchText: string;
    selectedWebsite: string;
    crawledSince: string;
    dueUntil: string;
    ratingMin?: number;
    ratingMax?: number;
    keyword?: string;
    ratingCategory?: string;
}

interface GlobalFilterHeaderProps {
    filters: FilterValues;
    onFilterChange: (filters: FilterValues) => void;
    showRatingFilters?: boolean;
    availableKeywords?: string[];
    availableCategories?: string[];
}

/**
 * Reusable global filter header component.
 * Auto-applies filters without requiring an Apply button.
 * Used across dashboards and export views for consistent filtering UX.
 */
export const GlobalFilterHeader: FC<GlobalFilterHeaderProps> = ({
    filters,
    onFilterChange,
    showRatingFilters = false,
    availableKeywords = [],
    availableCategories = [],
}) => {
    const websites = [
        { label: 'All Websites', value: '' },
        { label: 'TED Europe', value: 'TED Europe' },
        { label: 'Austria USP', value: 'Austria USP' },
        { label: 'Bund.de', value: 'Bund.de' },
        { label: 'SIMAP', value: 'SIMAP' },
        { label: 'Tender24', value: 'Tender24' },
        { label: 'e-Vergabe', value: 'e-Vergabe' },
        { label: 'Öffentliche Vergabe', value: 'Öffentliche Vergabe' },
        { label: 'Ausschreibungen DE', value: 'Ausschreibungen Deutschland' },
        { label: 'TK Vergabe', value: 'TK Vergabe', hidden: featureFlags.hideTkCrawler },
        { label: 'DB Vergabe', value: 'DB Vergabe', hidden: featureFlags.hideDbCrawler },
    ].filter(w => !w.hidden);

    const crawledSinceOptions = [
        { label: 'Any Time', value: '' },
        { label: 'Last 24 Hours', value: '24h' },
        { label: 'Last 7 Days', value: '7d' },
        { label: 'Last 30 Days', value: '30d' },
    ];

    const dueUntilOptions = [
        { label: 'Any Time', value: '' },
        { label: 'Next 7 Days', value: '7d' },
        { label: 'Next 30 Days', value: '30d' },
        { label: 'Next 90 Days', value: '90d' },
    ];

    const handleChange = (key: keyof FilterValues, value: string | number) => {
        onFilterChange({
            ...filters,
            [key]: value,
        });
    };

    return (
        <PFlex alignItems="flex-end" style={{ gap: '16px', flexWrap: 'wrap' }}>
            {/* Search Field */}
            <PFlexItem style={{ flex: 1, minWidth: '250px' }}>
                <PTextFieldWrapper label="Search Tenders">
                    <input
                        type="search"
                        placeholder="Search by headline, description, or caller..."
                        value={filters.searchText}
                        onChange={(e) => handleChange('searchText', e.target.value)}
                    />
                </PTextFieldWrapper>
            </PFlexItem>

            {/* Website Filter */}
            <PFlexItem style={{ width: '200px' }}>
                <PSelectWrapper label="Website">
                    <select
                        value={filters.selectedWebsite}
                        onChange={(e) => handleChange('selectedWebsite', e.target.value)}
                    >
                        {websites.map((w) => (
                            <option key={w.value} value={w.value}>
                                {w.label}
                            </option>
                        ))}
                    </select>
                </PSelectWrapper>
            </PFlexItem>

            {/* Crawled Since Filter */}
            <PFlexItem style={{ width: '180px' }}>
                <PSelectWrapper label="Crawled Since">
                    <select
                        value={filters.crawledSince}
                        onChange={(e) => handleChange('crawledSince', e.target.value)}
                    >
                        {crawledSinceOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </PSelectWrapper>
            </PFlexItem>

            {/* Due Until Filter */}
            <PFlexItem style={{ width: '180px' }}>
                <PSelectWrapper label="Due Until">
                    <select
                        value={filters.dueUntil}
                        onChange={(e) => handleChange('dueUntil', e.target.value)}
                    >
                        {dueUntilOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </PSelectWrapper>
            </PFlexItem>

            {/* Optional Rating Filters */}
            {showRatingFilters && (
                <>
                    {/* Rating Range */}
                    <PFlexItem style={{ width: '150px' }}>
                        <PTextFieldWrapper label="Min Rating">
                            <input
                                type="number"
                                placeholder="Min"
                                value={filters.ratingMin || ''}
                                onChange={(e) => handleChange('ratingMin', e.target.value ? parseFloat(e.target.value) : '')}
                            />
                        </PTextFieldWrapper>
                    </PFlexItem>

                    <PFlexItem style={{ width: '150px' }}>
                        <PTextFieldWrapper label="Max Rating">
                            <input
                                type="number"
                                placeholder="Max"
                                value={filters.ratingMax || ''}
                                onChange={(e) => handleChange('ratingMax', e.target.value ? parseFloat(e.target.value) : '')}
                            />
                        </PTextFieldWrapper>
                    </PFlexItem>

                    {/* Keyword Filter */}
                    {availableKeywords.length > 0 && (
                        <PFlexItem style={{ width: '200px' }}>
                            <PSelectWrapper label="Keyword">
                                <select
                                    value={filters.keyword || ''}
                                    onChange={(e) => handleChange('keyword', e.target.value)}
                                >
                                    <option value="">All Keywords</option>
                                    {availableKeywords.map((k) => (
                                        <option key={k} value={k}>
                                            {k}
                                        </option>
                                    ))}
                                </select>
                            </PSelectWrapper>
                        </PFlexItem>
                    )}

                    {/* Category Filter */}
                    {availableCategories.length > 0 && (
                        <PFlexItem style={{ width: '200px' }}>
                            <PSelectWrapper label="Category">
                                <select
                                    value={filters.ratingCategory || ''}
                                    onChange={(e) => handleChange('ratingCategory', e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {availableCategories.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </PSelectWrapper>
                        </PFlexItem>
                    )}
                </>
            )}
        </PFlex>
    );
};
