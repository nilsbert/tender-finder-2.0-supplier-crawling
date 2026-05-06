// @ts-nocheck
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GenericTenderFilter } from '../GenericTenderFilter';
import { vi } from 'vitest';

// Mock i18n translation hook
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k) => k })
}));

// Mock Porsche Design System components
vi.mock('@porsche-design-system/components-react', () => ({
    PFlex: ({ children, ...props }) => <div data-testid="p-flex" {...props}>{children}</div>,
    PButton: ({ children, onClick, ...props }) => <button onClick={onClick} {...props}>{children}</button>,
    PTextFieldWrapper: ({ children, label }) => <div><label>{label} {children}</label></div>,
    PSelectWrapper: ({ children, label }) => <div><label>{label} {children}</label></div>,
    PIcon: () => <span data-testid="p-icon" />,
    PText: ({ children }) => <span>{children}</span>,
}));


const mockWebsites = [
    { label: 'All Sources', value: '' },
    { label: 'Crawler A', value: 'crawler_a' }, // Should be Portal by default
    { label: 'Deutsche Bahn', value: 'db_crawler' }, // Should be Company by name detection
    { label: 'My Company', value: 'my_comp', type: 'company' }, // Explicit company
];

describe('GenericTenderFilter - Grouping Logic', () => {
    test('renders options grouped by Portals and Companies', () => {
        render(
            <GenericTenderFilter
                variant="crawling"
                searchText=""
                onSearchChange={vi.fn()}
                selectedWebsite=""
                onWebsiteChange={vi.fn()}
                websites={mockWebsites}
                // ... minimally required props
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

        const select = screen.getByLabelText(/source_label/i);
        const options = Array.from(select.querySelectorAll('option'));
        const optgroups = Array.from(select.querySelectorAll('optgroup'));

        // 1. All Sources (top level) + 1 in Portal + 2 in Company = 4 options total
        expect(options).toHaveLength(4);
        expect(options[0].textContent).toMatch(/All Sources/i);

        // 2. Check Optgroups
        expect(optgroups).toHaveLength(2);
        expect(optgroups[0].label).toMatch(/Portals/i);
        expect(optgroups[1].label).toMatch(/Companies/i);

        // 3. Check membership
        // 'Crawler A' should be in Portals
        expect(optgroups[0]).toContainElement(screen.getByText('Crawler A'));
        // 'Deutsche Bahn' and 'My Company' should be in Companies
        expect(optgroups[1]).toContainElement(screen.getByText('Deutsche Bahn'));
        expect(optgroups[1]).toContainElement(screen.getByText('My Company'));
    });
});


const mockCategories = ['Category1', 'Category2'];

describe('GenericTenderFilter - Crawling variant', () => {
    test('renders and triggers callbacks on interaction', () => {
        const handlers = {
            onSearchChange: vi.fn(),
            onWebsiteChange: vi.fn(),
            onFilterByChange: vi.fn(),
            onDateModeChange: vi.fn(),
            onSelectedDateChange: vi.fn(),
            onRangeStartChange: vi.fn(),
            onRangeEndChange: vi.fn(),
        };

        render(
            <GenericTenderFilter
                variant="crawling"
                searchText=""
                onSearchChange={handlers.onSearchChange}
                selectedWebsite=""
                onWebsiteChange={handlers.onWebsiteChange}
                websites={mockWebsites}
                filterBy="crawl"
                onFilterByChange={handlers.onFilterByChange}
                dateMode="single"
                onDateModeChange={handlers.onDateModeChange}
                selectedDate="2024-01-01"
                onSelectedDateChange={handlers.onSelectedDateChange}
                rangeStart=""
                onRangeStartChange={handlers.onRangeStartChange}
                rangeEnd=""
                onRangeEndChange={handlers.onRangeEndChange}
                // rating & type filters not used in crawling variant
                ratingMin={null}
                onRatingMinChange={() => { }}
                ratingMax={null}
                onRatingMaxChange={() => { }}
                typeFilter=""
                onTypeChange={() => { }}
                subTypeFilter=""
                onSubTypeChange={() => { }}
                categories={[]}
                onResetFilters={() => { }}
                extraActions={null}
            />
        );

        // Search input
        const searchInput = screen.getByPlaceholderText(/search_placeholder/i);
        fireEvent.change(searchInput, { target: { value: 'test' } });
        expect(handlers.onSearchChange).toHaveBeenCalledWith('test');

        // Website select
        const websiteSelect = screen.getByLabelText(/source_label/i);
        fireEvent.change(websiteSelect, { target: { value: 'crawler_a' } });
        expect(handlers.onWebsiteChange).toHaveBeenCalledWith('crawler_a');

        // Filter by button
        const crawlBtn = screen.getByText(/crawl_date/i);
        fireEvent.click(crawlBtn);
        expect(handlers.onFilterByChange).toHaveBeenCalledWith('crawl');

        // Date mode toggle
        const singleBtn = screen.getByText(/single_day/i);
        fireEvent.click(singleBtn);
        expect(handlers.onDateModeChange).toHaveBeenCalledWith('single');

        // Change selected date
        const dateInput = screen.getByLabelText(/selected_day/i);
        fireEvent.change(dateInput, { target: { value: '2024-01-02' } });
        expect(handlers.onSelectedDateChange).toHaveBeenCalledWith('2024-01-02');
    });

    test('triggers date range callbacks', () => {
        const handlers = {
            onRangeStartChange: vi.fn(),
            onRangeEndChange: vi.fn(),
        };

        render(
            <GenericTenderFilter
                variant="crawling"
                searchText=""
                onSearchChange={vi.fn()}
                selectedWebsite=""
                onWebsiteChange={vi.fn()}
                websites={mockWebsites}
                dateMode="range"
                onDateModeChange={vi.fn()}
                rangeStart="2024-01-01"
                onRangeStartChange={handlers.onRangeStartChange}
                rangeEnd=""
                onRangeEndChange={handlers.onRangeEndChange}
                // ... other required props stubs
                onSelectedDateChange={vi.fn()}
                onFilterByChange={vi.fn()}
                onRatingMinChange={vi.fn()}
                onTypeChange={vi.fn()}
                onSubTypeChange={vi.fn()}
            />
        );

        const startInputs = screen.getAllByLabelText(/start_date/i);
        const startInput = startInputs[0];
        fireEvent.change(startInput, { target: { value: '2024-01-02' } });
        expect(handlers.onRangeStartChange).toHaveBeenCalledWith('2024-01-02');

        const endInputs = screen.getAllByLabelText(/end_date/i);
        const endInput = endInputs[0];
        fireEvent.change(endInput, { target: { value: '2024-12-31' } });
        expect(handlers.onRangeEndChange).toHaveBeenCalledWith('2024-12-31');
    });
});

describe('GenericTenderFilter - Rating variant', () => {
    test('renders rating, type filters, office filter, and reset button, and triggers callbacks', () => {
        const handlers = {
            onRatingMinChange: vi.fn(),
            onTypeChange: vi.fn(),
            onSubTypeChange: vi.fn(),
            onOfficeChange: vi.fn(),
            onResetFilters: vi.fn(),
        };

        const mockOffices = [
            { label: 'All Offices', value: '' },
            { label: 'Headquarters', value: 'HQ' }
        ];

        render(
            <GenericTenderFilter
                variant="rating"
                searchText=""
                onSearchChange={() => { }}
                selectedWebsite=""
                onWebsiteChange={() => { }}
                websites={mockWebsites}
                ratingMin={null}
                onRatingMinChange={handlers.onRatingMinChange}
                ratingMax={null}
                onRatingMaxChange={() => { }}
                typeFilter=""
                onTypeChange={handlers.onTypeChange}
                subTypeFilter=""
                onSubTypeChange={handlers.onSubTypeChange}
                categories={mockCategories}
                // Office props
                selectedOffice=""
                onOfficeChange={handlers.onOfficeChange}
                offices={mockOffices}
                // Reset prop
                onResetFilters={handlers.onResetFilters}
                extraActions={null}
            />
        );

        // Rating select
        // Now that mock associates label correctly, we can use label queries.
        // Use getAll because 'min_score' might be reused or rendered ambiguously.
        const ratingSelects = screen.getAllByLabelText(/min_score/i);
        const ratingSelect = ratingSelects[0];


        fireEvent.change(ratingSelect, { target: { value: '20' } });
        expect(handlers.onRatingMinChange).toHaveBeenCalledWith(20);

        // Type select
        const typeSelects = screen.getAllByLabelText(/type_label/i);
        const typeSelect = typeSelects[0];
        fireEvent.change(typeSelect, { target: { value: 'Service' } });
        expect(handlers.onTypeChange).toHaveBeenCalledWith('Service');

        // Subtype select
        const subTypeSelect = screen.getByLabelText(/subtype_label/i);
        fireEvent.change(subTypeSelect, { target: { value: 'Category1' } });
        expect(handlers.onSubTypeChange).toHaveBeenCalledWith('Category1');

        // Office select
        const officeSelect = screen.getByLabelText(/office_label/i);
        fireEvent.change(officeSelect, { target: { value: 'HQ' } });
        expect(handlers.onOfficeChange).toHaveBeenCalledWith('HQ');

        // Reset button
        const resetBtn = screen.getByText(/analysis.filter.reset/i);
        fireEvent.click(resetBtn);
        expect(handlers.onResetFilters).toHaveBeenCalled();
    });
    test('renders grouped categories when keywordTree is provided', () => {
        const keywordTree = {
            'Service': ['Consulting', 'IT'],
            'Sector': ['Automotive', 'Energy']
        };

        render(
            <GenericTenderFilter
                variant="rating"
                searchText=""
                onSearchChange={vi.fn()}
                selectedWebsite=""
                onWebsiteChange={vi.fn()}
                websites={mockWebsites}
                keywordTree={keywordTree}
                onSubTypeChange={vi.fn()}
                // stub required props
                onRatingMinChange={vi.fn()}
                onTypeChange={vi.fn()}
            />
        );

        const subTypeSelect = screen.getByLabelText(/subtype_label/i);
        const optgroups = Array.from(subTypeSelect.querySelectorAll('optgroup'));

        expect(optgroups).toHaveLength(2);
        // Because of translation mock in line 10 (t: k => k), label will be key 'analysis.filter.type_service'
        expect(optgroups[0].label).toMatch(/analysis.filter.type_service/);
        expect(optgroups[1].label).toMatch(/analysis.filter.type_sector/);

        expect(optgroups[0]).toContainElement(screen.getByText('Consulting'));
        expect(optgroups[1]).toContainElement(screen.getByText('Automotive'));
    });
});
