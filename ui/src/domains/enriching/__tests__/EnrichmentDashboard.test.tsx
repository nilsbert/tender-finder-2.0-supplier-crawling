
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import EnrichmentDashboard from '../EnrichmentDashboard';
import { api } from '../api';

// Mock API
vi.mock('../api', () => ({
    api: {
        getStatus: vi.fn(),
        getQueue: vi.fn(),
        startBatch: vi.fn(),
        retryAllFailed: vi.fn(),
    }
}));

// Mock Queue Table Component to avoid complexity in integration test
vi.mock('../EnrichmentQueueTable', () => ({
    default: () => <div data-testid="queue-table">Queue Table Mock</div>
}));

// Mock StandardPageHeader
vi.mock('../../components/StandardPageHeader', () => ({
    StandardPageHeader: ({ title, subtitle }: any) => (
        <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
        </div>
    )
}));

describe('EnrichmentDashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state initially', () => {
        (api.getStatus as any).mockReturnValue(new Promise(() => { })); // pending
        render(<EnrichmentDashboard />);
        expect(screen.getByText('Loading status...')).toBeInTheDocument();
    });

    it('renders operational metrics after loading', async () => {
        // Mock Status
        (api.getStatus as any).mockResolvedValue({
            queue_depth: 5,
            active_workers: 2,
            failed_count: 1,
            rate_limit_paused: false,
            total_processed: 100,
            pending_count: 5
        });

        render(<EnrichmentDashboard />);

        await waitFor(() => {
            expect(screen.getByText('Operational Metrics')).toBeInTheDocument();
        });

        // Check values
        expect(screen.getByText('5')).toBeInTheDocument(); // Queue Depth
        expect(screen.getByText('2')).toBeInTheDocument(); // Active Workers
        expect(screen.getByText('1')).toBeInTheDocument(); // Failed
    });

    it('triggering batch scan calls API', async () => {
        (api.getStatus as any).mockResolvedValue({
            queue_depth: 0,
            active_workers: 0,
            failed_count: 0,
        });

        render(<EnrichmentDashboard />);
        await waitFor(() => expect(screen.getByText('Start Batch Scan')).toBeInTheDocument());

        const startButton = screen.getByText('Start Batch Scan');
        fireEvent.click(startButton);

        expect(api.startBatch).toHaveBeenCalledWith(false);
    });

    it('clicking retry all calls API', async () => {
        (api.getStatus as any).mockResolvedValue({
            queue_depth: 0,
            active_workers: 0,
            failed_count: 5, // Triggers enablement
        });

        render(<EnrichmentDashboard />);
        await waitFor(() => expect(screen.getByText('Retry All Failed')).toBeInTheDocument());

        const retryButton = screen.getByText('Retry All Failed');
        fireEvent.click(retryButton);

        expect(api.retryAllFailed).toHaveBeenCalled();
    });
});
