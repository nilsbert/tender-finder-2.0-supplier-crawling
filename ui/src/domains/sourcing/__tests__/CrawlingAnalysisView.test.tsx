import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CrawlingAnalysisView from '../CrawlingAnalysisView';

// Mock API and Components
vi.mock('../api', () => ({
    api: {
        searchTenders: vi.fn().mockResolvedValue([]),
        getDateDistribution: vi.fn().mockResolvedValue([])
    }
}));

// Mock Porsche Design System components (basic divs for now)
vi.mock('@porsche-design-system/components-react', () => ({
    PHeading: ({ children }: any) => <h1>{children}</h1>,
    PText: ({ children }: any) => <p>{children}</p>,
    PFlex: ({ children }: any) => <div className="p-flex">{children}</div>,
    PSpinner: () => <div>Loading...</div>,
    PDivider: () => <hr />,
    PButton: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
    PIcon: () => <span>Icon</span>,
    PContentWrapper: ({ children }: any) => <div>{children}</div>,
    PSelectWrapper: ({ children, label }: any) => <label>{label}{children}</label>,
    PTextFieldWrapper: ({ children, label }: any) => <label>{label}{children}</label>,
    PTag: ({ children }: any) => <span>{children}</span>,
}));

vi.mock('../../components/AnalyticsCharts', () => ({
    StackedBarChart: () => <div data-testid="stacked-bar-chart">Chart</div>,
    LegendItem: () => <div>Legend</div>
}));

vi.mock('nuqs', () => ({
    useQueryState: (key: string, serializer: any) => {
        return ['', vi.fn()]; // Simple mock, static state
    },
    parseAsString: { withDefault: (val: any) => val }
}));

describe('CrawlingAnalysisView', () => {
    it('renders the main heading', () => {
        render(<CrawlingAnalysisView />);
        expect(screen.getByText('Crawling Analysis')).toBeInTheDocument();
    });

    it('renders filter inputs', () => {
        render(<CrawlingAnalysisView />);
        expect(screen.getByLabelText(/Search/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Crawler/i)).toBeInTheDocument();
    });

    it('renders the chart container', () => {
        render(<CrawlingAnalysisView />);
        expect(screen.getByText('Crawler Activity')).toBeInTheDocument();
    });

    it('renders the table headers', () => {
        render(<CrawlingAnalysisView />);
        // Table headers might need time or data, but structured check
        expect(screen.getByRole('table')).toBeInTheDocument();
    });
});
