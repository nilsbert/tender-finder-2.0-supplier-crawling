import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReleaseNotesModal } from '../ReleaseNotesModal';

// Mock Porsche Design System components
vi.mock('@porsche-design-system/components-react', () => ({
    PModal: ({ children, open, heading }: any) => open ? (
        <div role="dialog" aria-label="Release Notes Modal">
            <h1>{heading}</h1>
            {children}
        </div>
    ) : null,
    PHeading: ({ children }: any) => <h2>{children}</h2>,
    PText: ({ children }: any) => <span>{children}</span>,
    PDivider: () => <hr />,
    PSpinner: () => <div role="progressbar" />,
    PFlex: ({ children, style }: any) => <div style={style}>{children}</div>,
    PIcon: ({ name }: any) => <span data-testid={`icon-${name}`} />
}));

const mockNotes = [
    { version: '1.3.0', date: '2026-02-05', title: 'Big Update', changes: ['Change 1'] }
];

describe('ReleaseNotesModal', () => {
    it('should render correctly when open', () => {
        render(
            <ReleaseNotesModal
                isOpen={true}
                onClose={vi.fn()}
                notes={mockNotes}
                loading={false}
            />
        );

        expect(screen.getByText('System Updates')).toBeDefined();
        expect(screen.getByText(/Version 1.3.0/)).toBeDefined();
        expect(screen.getByText(/Big Update/)).toBeDefined();
    });

    it('should show loading spinner when loading', () => {
        render(
            <ReleaseNotesModal
                isOpen={true}
                onClose={vi.fn()}
                notes={[]}
                loading={true}
            />
        );

        // Checking for presence of loading spinner
        expect(screen.getByRole('progressbar')).toBeDefined();
    });

    it('should call onClose when close button is clicked', () => {
        const onClose = vi.fn();
        render(
            <ReleaseNotesModal
                isOpen={true}
                onClose={onClose}
                notes={mockNotes}
                loading={false}
            />
        );

        // Assuming MUI close button has an aria-label or specific text
        const closeBtn = screen.getByLabelText('close');
        fireEvent.click(closeBtn);
        expect(onClose).toHaveBeenCalled();
    });

    it('should display error message when provided', () => {
        render(
            <ReleaseNotesModal
                isOpen={true}
                onClose={vi.fn()}
                notes={[]}
                loading={false}
                error="Test Error Message"
            />
        );

        expect(screen.getByText('Test Error Message')).toBeDefined();
    });
});
