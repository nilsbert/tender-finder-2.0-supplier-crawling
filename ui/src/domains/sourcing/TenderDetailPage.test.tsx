import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { TenderDetailPage } from './TenderDetailPage';
import { api } from './api';
import { api as ratingApi } from '../rating/api';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('./api');
vi.mock('../rating/api');
// Mock Porsche Design System components
vi.mock('@porsche-design-system/components-react', async () => {
    const actual = await vi.importActual('@porsche-design-system/components-react');
    return {
        ...actual,
        PContentWrapper: ({ children }: any) => <div data-testid="p-content-wrapper">{children}</div>,
        PHeading: ({ children }: any) => <h1 data-testid="p-heading">{children}</h1>,
        PButton: ({ children, onClick, loading }: any) => (
            <button onClick={onClick} disabled={loading} data-testid="p-button">
                {children}
            </button>
        ),
        PFlex: ({ children }: any) => <div data-testid="p-flex">{children}</div>,
        PFlexItem: ({ children }: any) => <div>{children}</div>,
        PGrid: ({ children }: any) => <div>{children}</div>,
        PGridItem: ({ children }: any) => <div>{children}</div>,
        PText: ({ children }: any) => <span>{children}</span>,
        PTag: ({ children }: any) => <span>{children}</span>,
        PLink: ({ children, href }: any) => <a href={href}>{children}</a>,
        PInlineNotification: ({ children }: any) => <div>{children}</div>,
        PModal: ({ children, open, onDismiss }: any) => (open ? <div data-testid="p-modal"><button onClick={onDismiss}>Close</button>{children}</div> : null),
        PDivider: () => <hr />,
        PTabs: ({ children }: any) => <div data-testid="p-tabs">{children}</div>,
        PTabsItem: ({ children, label }: any) => <div data-testid={`p-tab-item-${label}`}>{children}</div>,
    }
});

// Mock hooks
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: () => ({ id: '123' }),
        useNavigate: () => vi.fn(),
    };
});

describe('TenderDetailPage', () => {
    const mockTender = {
        id: '123',
        headline: 'Test Tender Headline',
        description: 'Test Description',
        caller: 'Test Caller',
        published: '2023-01-01T00:00:00Z',
        due: '2023-02-01T00:00:00Z',
        est_volume: '100k',
        cpv_codes: ['72000000'],
        url: 'http://example.com',
        rating_total: 800,
        matched_keywords: [{ term: 'IT', score: 100 }],
        enrichment: {
            ai_summary: 'AI Summary Content',
            ai_bid_onepager: 'Bid Strategy Content',
            required_profiles: ['Developer'],
            required_references: ['Reference 1'],
            est_volume_ai: '120k'
        },
        ai_enriched_at: '2023-01-02T00:00:00Z',
        headline_ai: 'AI Optimized Headline',
        location: 'Berlin',
        location_ai: 'Berlin'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (api.getTender as any).mockResolvedValue(mockTender);
        (ratingApi.enrichTender as any).mockResolvedValue({ message: 'Enrichment started' });
        (ratingApi.rateTender as any).mockResolvedValue({ message: 'Rated' });
    });

    it('renders loading state initially', () => {
        // Mock a delayed promise to check loading state
        (api.getTender as any).mockImplementation(() => new Promise(() => { }));
        render(
            <BrowserRouter>
                <TenderDetailPage />
            </BrowserRouter>
        );
        expect(screen.getByText('Loading Tender...')).toBeInTheDocument();
    });

    it('renders tender details after loading', async () => {
        render(
            <BrowserRouter>
                <TenderDetailPage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('AI Optimized Headline')).toBeInTheDocument();
            expect(screen.getByText('Original: Test Tender Headline')).toBeInTheDocument();
            expect(screen.getByText('AI Summary Content')).toBeInTheDocument();
            expect(screen.getByText('Bid Strategy Content')).toBeInTheDocument();
        });
    });

    it('triggers enrichment when enrich button is clicked', async () => {
        render(
            <BrowserRouter>
                <TenderDetailPage />
            </BrowserRouter>
        );

        await waitFor(() => screen.getByText('AI Optimized Headline'));

        // Find and click enrich button (labeled 'Re-Enrich' because hasAiEnrichment is true)
        const enrichButton = screen.getByText('Re-Enrich');
        fireEvent.click(enrichButton);

        await waitFor(() => {
            expect(ratingApi.enrichTender).toHaveBeenCalledWith('123');
        });
    });

    it('triggers scoring when score button is clicked', async () => {
        render(
            <BrowserRouter>
                <TenderDetailPage />
            </BrowserRouter>
        );

        await waitFor(() => screen.getByText('AI Optimized Headline'));

        const scoreButton = screen.getByText('Score Again');
        fireEvent.click(scoreButton);

        await waitFor(() => {
            expect(ratingApi.rateTender).toHaveBeenCalledWith('123');
        });
    });
});
