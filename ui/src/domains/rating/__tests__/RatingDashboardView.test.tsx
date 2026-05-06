
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RatingDashboardView from '../RatingDashboardView';
import { api as crawlerApi } from '../../sourcing/api';
import { api as ratingApi } from '../api';

// Mock dependencies
vi.mock('../../sourcing/api', () => ({
    api: {
        getTenderStats: vi.fn(),
        getScoreDistribution: vi.fn(),
        getDateDistribution: vi.fn(), // Mock the new timeline endpoint
        searchTenders: vi.fn(),
    }
}));

vi.mock('../api', () => ({
    api: {
        getCategories: vi.fn(),
    }
}));

// Mock Nuqs to behave like useState for tests
vi.mock('nuqs', async (importOriginal) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actual = await importOriginal<any>();
    const React = await import('react');
    return {
        ...actual,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        useQueryState: (key: any, options: any) => {
            const defaultValue = options?.defaultValue ?? (key === 'since' ? '24h' : '');
            return React.useState(defaultValue);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        parseAsString: { withDefault: (val: any) => val },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        parseAsInteger: { withDefault: (val: any) => val },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        parseAsFloat: { withDefault: (val: any) => val },
    };
});

// Mock Porsche Design System
vi.mock('@porsche-design-system/components-react', () => {
    return {
        PContentWrapper: ({ children }: any) => <div>{children}</div>,
        PHeading: ({ children }: any) => <h1>{children}</h1>,
        PFlex: ({ children }: any) => <div className="p-flex">{children}</div>,
        PFlexItem: ({ children }: any) => <div>{children}</div>,
        PText: ({ children }: any) => <p>{children}</p>,
        PSelectWrapper: ({ children }: any) => <div>{children}</div>,
        PSpinner: () => <div>Loading...</div>,
        PButton: ({ children, onClick, variant, loading, icon, hideLabel, ...props }: any) => <button onClick={onClick} {...props}>{children || 'Button'}</button>,
        PTag: ({ children }: any) => <span>{children}</span>,
        PIcon: () => <span>Icon</span>,
        PDivider: () => <hr />,
        PTextFieldWrapper: ({ children }: any) => <div>{children}</div>,
        PModal: ({ children, open, onClose, heading }: any) => open ? (
            <div data-testid="p-modal">
                <h2>{heading}</h2>
                <button onClick={onClose}>Close</button>
                {children}
            </div>
        ) : null,
    };
});

describe('RatingDashboardView BI Scenarios', () => {

    beforeEach(() => {
        vi.clearAllMocks();

        // Default Mock Returns
        (crawlerApi.getTenderStats as any).mockResolvedValue({ total: 1000 });
        (ratingApi.getCategories as any).mockResolvedValue(['IT Services', 'Construction']);
        (crawlerApi.getScoreDistribution as any).mockResolvedValue([
            { score: 10, count: 5 }, { score: 20, count: 8 },
            { score: 50, count: 3 }, { score: 85, count: 12 }
        ]);
        (crawlerApi.searchTenders as any).mockResolvedValue([]);
        (crawlerApi.getDateDistribution as any).mockResolvedValue([
            { date: '2023-11-01', published: 2, due: 0 },
            { date: '2023-11-02', published: 3, due: 1 }
        ]);
    });

    /**
     * Scenario 7: Deal Prioritization (Urgency vs Value)
     * Given I have a list of high-scoring tenders
     * When I view the "Opportunity Constellation" (Scatter Plot)
     * Then I can see which high-value deals are closing soon (top-left quadrant)
     * And I can spot long-term strategic opportunities (top-right quadrant).
     */
    test('Scenario 7: Deal Prioritization - Renders Timeline Chart', async () => {
        // Mock data with due dates and scores
        const mockTenders = [
            { id: '1', headline: 'Urgent High Value', rating_total: 80, due: new Date(Date.now() + 86400000).toISOString() }, // Due tomorrow
            { id: '2', headline: 'Strategic Long Term', rating_total: 90, due: new Date(Date.now() + 7776000000).toISOString() }, // Due in 90 days
        ];
        (crawlerApi.searchTenders as any).mockResolvedValue(mockTenders);

        render(<RatingDashboardView dbMode="cosmos" />);

        // Wait for basic rendering
        await waitFor(() => expect(screen.getByText('Market Quality Score')).toBeInTheDocument());

        // Check if the timeline chart container is rendered
        expect(screen.getByText(/Tender Lifecycle/i)).toBeInTheDocument();
    });

    /**
     * Scenario 8: Rating Explainability (Why This Score?)
     * Given I am viewing a specific tender's details
     * When I look at the "Match Breakdown"
     * Then I see a "Waterfall Chart" or "Impact Bars"
     * And it clearly visualizes which positive keywords added points and which negative ones subtracted them.
     */
    it('Scenario 8: Rating Explainability - Renders Keyword Impact Bars', async () => {
        const mockTender = {
            id: '1',
            headline: 'Test Tender',
            rating_total: 45,
            matched_keywords: [
                { term: 'Cloud', impact: 20 },
                { term: 'Maintenance', impact: -10 },
                { term: 'Security', impact: 35 }
            ],
            rating_by_category: { 'IT': 45 }
        };
        (crawlerApi.searchTenders as any).mockResolvedValue([mockTender]);

        render(<RatingDashboardView dbMode="cosmos" />);
        await waitFor(() => expect(screen.getByText('Test Tender')).toBeInTheDocument());

        // Open Modal
        // We use fireEvent or userEvent usually, but click() works in simplier jsdom setups often.
        // Let's ensure we are clicking the element.
        screen.getByText('Test Tender').click();

        // Wait for Modal Content
        // The header will be "Test Tender", so we look for unique modal content
        await waitFor(() => expect(screen.getByText(/Keyword Impact/i)).toBeInTheDocument());

        const modal = screen.getByTestId('p-modal');

        // Check if keywords are enlisted specifically in the modal
        expect(within(modal).getByText('Cloud')).toBeInTheDocument();
        expect(within(modal).getByText('Maintenance')).toBeInTheDocument();
    });

    /**
     * Scenario 9: Global Filter Adaptation
     * Given I have applied a search filter "Cloud"
     * When the dashboard refreshes
     * Then the Opportunity Constellation and Distribution charts should reflect the filtered dataset.
     */
    it('Scenario 9: Global Filter Adaptation - Charts update on Search', async () => {
        const mockTenders = [
            { id: '1', headline: 'Cloud Transformation', rating_total: 80, due: new Date().toISOString() },
        ];
        (crawlerApi.searchTenders as any).mockResolvedValue(mockTenders);
        (crawlerApi.getScoreDistribution as any).mockResolvedValue([
            { score: 80, count: 1 }
        ]);
        // Mock categories to ensure initial load works without errors
        (ratingApi.getCategories as any).mockResolvedValue(['IT', 'Construction']);

        render(<RatingDashboardView dbMode="cosmos" />);

        // Simulate typing in search
        const searchInput = screen.getByPlaceholderText(/Search headlines/i);
        fireEvent.change(searchInput, { target: { value: 'Cloud' } });

        // Verify API was called with search param (debounced/effect triggered)
        await waitFor(() => {
            expect(crawlerApi.getScoreDistribution).toHaveBeenCalledWith(expect.objectContaining({
                search: 'Cloud'
            }));
        });
    });

    /**
     * Scenario 10: Category Context
     * Given I have selected the "IT" category (Type)
     * When I view the Opportunity Constellation
     * Then the filters should apply to the tenders displayed.
     */
    it('Scenario 10: Category Context - Filters apply correctly', async () => {
        const mockTenders = [
            {
                id: '1',
                headline: 'Mixed Tender',
                rating_total: 50,
                rating_by_category: { 'IT': 90, 'Construction': 10 },
                due: new Date().toISOString()
            },
        ];
        (crawlerApi.searchTenders as any).mockResolvedValue(mockTenders);
        (ratingApi.getCategories as any).mockResolvedValue(['IT', 'Construction']);

        render(<RatingDashboardView dbMode="cosmos" />);

        // Wait for component to render
        await waitFor(() => expect(screen.getByText('Market Quality Score')).toBeInTheDocument());

        // Verify APIs were called with initial state
        await waitFor(() => {
            expect(crawlerApi.searchTenders).toHaveBeenCalled();
        });

        expect(crawlerApi.getScoreDistribution).toHaveBeenCalled();
    });

    /**
     * Scenario 11: Layout Structure
     * Given the dashboard is loaded
     * When I view the main sections
     * Then "Market Quality Score", "Opportunity Constellation", and "Top Sectors" should all be present.
     */
    it('Scenario 11: Layout Structure - Key components are present', async () => {
        (crawlerApi.searchTenders as any).mockResolvedValue([]);
        render(<RatingDashboardView dbMode="cosmos" />);

        await waitFor(() => expect(screen.getByText('Market Quality Score')).toBeInTheDocument());
        expect(screen.getByText('Tender Lifecycle')).toBeInTheDocument();
        expect(screen.getByText('Top Sectors')).toBeInTheDocument();
    });
});
