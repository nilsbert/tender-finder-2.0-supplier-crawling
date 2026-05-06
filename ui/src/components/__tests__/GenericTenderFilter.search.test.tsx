import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GenericTenderFilter } from '../GenericTenderFilter';

/**
 * Search Filter Component Tests
 * 
 * Tests for the search input functionality within GenericTenderFilter component.
 * Focuses on search input rendering, onChange behavior, and user interactions.
 */

// Mock Porsche Design System components
vi.mock('@porsche-design-system/components-react', () => ({
    PFlex: ({ children, ...props }: any) => <div data-testid="p-flex" {...props}>{children}</div>,
    PButton: ({ children, onClick, ...props }: any) => <button onClick={onClick} {...props}>{children}</button>,
    PTextFieldWrapper: ({ children, label }: any) => <div><label>{label} {children}</label></div>,
    PSelectWrapper: ({ children, label }: any) => <div><label>{label} {children}</label></div>,
    PIcon: () => <span data-testid="p-icon" />,
    PText: ({ children }: any) => <span>{children}</span>,
}));

const mockWebsites = [
    { label: 'All Sources', value: '' },
    { label: 'TED Europe', value: 'ted_europe' },
];

describe('GenericTenderFilter - Search Functionality', () => {
    it('renders search input with correct placeholder', () => {
        render(
            <GenericTenderFilter
                variant="rating"
                searchText=""
                onSearchChange={vi.fn()}
                selectedWebsite=""
                onWebsiteChange={vi.fn()}
                websites={mockWebsites}
                onFilterByChange={vi.fn()}
                onDateModeChange={vi.fn()}
                onSelectedDateChange={vi.fn()}
                onRangeStartChange={vi.fn()}
                onRangeEndChange={vi.fn()}
                onRatingMinChange={vi.fn()}
                onTypeChange={vi.fn()}
                onSubTypeChange={vi.fn()}
            />
        );

        const searchInput = screen.getByPlaceholderText(/search_placeholder/i);
        expect(searchInput).toBeInTheDocument();
    });

    it('calls onSearchChange when user types in search input', () => {
        const onSearchChange = vi.fn();

        render(
            <GenericTenderFilter
                variant="rating"
                searchText=""
                onSearchChange={onSearchChange}
                selectedWebsite=""
                onWebsiteChange={vi.fn()}
                websites={mockWebsites}
                onFilterByChange={vi.fn()}
                onDateModeChange={vi.fn()}
                onSelectedDateChange={vi.fn()}
                onRangeStartChange={vi.fn()}
                onRangeEndChange={vi.fn()}
                onRatingMinChange={vi.fn()}
                onTypeChange={vi.fn()}
                onSubTypeChange={vi.fn()}
            />
        );

        const searchInput = screen.getByPlaceholderText(/search_placeholder/i);
        fireEvent.change(searchInput, { target: { value: 'solar' } });

        expect(onSearchChange).toHaveBeenCalledWith('solar');
    });

    it('displays current search text value', () => {
        render(
            <GenericTenderFilter
                variant="rating"
                searchText="vienna"
                onSearchChange={vi.fn()}
                selectedWebsite=""
                onWebsiteChange={vi.fn()}
                websites={mockWebsites}
                onFilterByChange={vi.fn()}
                onDateModeChange={vi.fn()}
                onSelectedDateChange={vi.fn()}
                onRangeStartChange={vi.fn()}
                onRangeEndChange={vi.fn()}
                onRatingMinChange={vi.fn()}
                onTypeChange={vi.fn()}
                onSubTypeChange={vi.fn()}
            />
        );

        const searchInput = screen.getByPlaceholderText(/search_placeholder/i) as HTMLInputElement;
        expect(searchInput.value).toBe('vienna');
    });

    it('handles empty search input', () => {
        const onSearchChange = vi.fn();

        render(
            <GenericTenderFilter
                variant="rating"
                searchText="test"
                onSearchChange={onSearchChange}
                selectedWebsite=""
                onWebsiteChange={vi.fn()}
                websites={mockWebsites}
                onFilterByChange={vi.fn()}
                onDateModeChange={vi.fn()}
                onSelectedDateChange={vi.fn()}
                onRangeStartChange={vi.fn()}
                onRangeEndChange={vi.fn()}
                onRatingMinChange={vi.fn()}
                onTypeChange={vi.fn()}
                onSubTypeChange={vi.fn()}
            />
        );

        const searchInput = screen.getByPlaceholderText(/search_placeholder/i);
        fireEvent.change(searchInput, { target: { value: '' } });

        expect(onSearchChange).toHaveBeenCalledWith('');
    });

    it('handles special characters in search input', () => {
        const onSearchChange = vi.fn();

        render(
            <GenericTenderFilter
                variant="rating"
                searchText=""
                onSearchChange={onSearchChange}
                selectedWebsite=""
                onWebsiteChange={vi.fn()}
                websites={mockWebsites}
                onFilterByChange={vi.fn()}
                onDateModeChange={vi.fn()}
                onSelectedDateChange={vi.fn()}
                onRangeStartChange={vi.fn()}
                onRangeEndChange={vi.fn()}
                onRatingMinChange={vi.fn()}
                onTypeChange={vi.fn()}
                onSubTypeChange={vi.fn()}
            />
        );

        const searchInput = screen.getByPlaceholderText(/search_placeholder/i);
        fireEvent.change(searchInput, { target: { value: 'test & development' } });

        expect(onSearchChange).toHaveBeenCalledWith('test & development');
    });

    it('works in crawling variant as well', () => {
        const onSearchChange = vi.fn();

        render(
            <GenericTenderFilter
                variant="crawling"
                searchText=""
                onSearchChange={onSearchChange}
                selectedWebsite=""
                onWebsiteChange={vi.fn()}
                websites={mockWebsites}
                filterBy="crawl"
                onFilterByChange={vi.fn()}
                dateMode="single"
                onDateModeChange={vi.fn()}
                selectedDate="2024-01-01"
                onSelectedDateChange={vi.fn()}
                rangeStart=""
                onRangeStartChange={vi.fn()}
                rangeEnd=""
                onRangeEndChange={vi.fn()}
                ratingMin={null}
                onRatingMinChange={vi.fn()}
                ratingMax={null}
                onRatingMaxChange={vi.fn()}
                typeFilter=""
                onTypeChange={vi.fn()}
                subTypeFilter=""
                onSubTypeChange={vi.fn()}
                categories={[]}
            />
        );

        const searchInput = screen.getByPlaceholderText(/search_placeholder/i);
        fireEvent.change(searchInput, { target: { value: 'construction' } });

        expect(onSearchChange).toHaveBeenCalledWith('construction');
    });
});
