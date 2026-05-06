import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StartupView from '../StartupView';
import { startupService } from '../startupService';
// ThemeProvider removed


// Mock the Porsche Design System provider if needed, or wrap render
// Usually simpler to just mock the service.

vi.mock('../startupService');

describe('StartupView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders startup steps correctly', async () => {
        vi.mocked(startupService.getStartupStatus).mockResolvedValue({
            is_ready: false,
            steps: [
                { name: 'Load Config', status: 'completed' },
                { name: 'Connect DB', status: 'in_progress' }
            ]
        });

        render(<StartupView />);

        await waitFor(() => {
            expect(screen.getByText('Load Config')).toBeInTheDocument();
            expect(screen.getByText('Connect DB')).toBeInTheDocument();
        });
    });

    it('shows retry button on failure', async () => {
        vi.mocked(startupService.getStartupStatus).mockResolvedValue({
            is_ready: false,
            steps: [
                { name: 'Load Config', status: 'failed', message: 'Config error' }
            ]
        });

        render(<StartupView />);

        await waitFor(() => {
            expect(screen.getByText('Retry')).toBeInTheDocument();
            expect(screen.getByText('Config error')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Retry'));
        expect(startupService.retryStartup).toHaveBeenCalled();
    });
});
