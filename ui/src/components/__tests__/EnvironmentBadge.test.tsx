import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EnvironmentBadge } from '../EnvironmentBadge';
import { useAuth } from '../../domains/auth/AuthProvider';

// Mock Auth Context
vi.mock('../../domains/auth/AuthProvider', () => ({
    useAuth: vi.fn()
}));

// Mock Translations
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

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
    PButton: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
    PTag: ({ children }: any) => <span>{children}</span>,
    PTextFieldWrapper: ({ children, label }: any) => <div><label>{label}</label>{children}</div>,
    PFlexItem: ({ children, style }: any) => <div style={style}>{children}</div>,
    PDivider: () => <hr />,
    PSpinner: () => <div role="progressbar" />,
    PFlex: ({ children, style }: any) => <div style={style}>{children}</div>,
    PIcon: ({ name }: any) => <span data-testid={`icon-${name}`} />
}));

// Mock useReleaseNotes
vi.mock('../../hooks/useReleaseNotes', () => ({
    useReleaseNotes: () => ({
        versions: [],
        loading: false,
        error: null,
        hasNewUpdate: false,
        markAsRead: vi.fn()
    })
}));

describe('EnvironmentBadge - Role Switcher', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should show "Switch Role" button and display current role in DEVELOPMENT', async () => {
        const toggleRole = vi.fn();
        (useAuth as any).mockReturnValue({
            identity: { email: 'dev@mhp.com', name: 'Dev', isAdmin: true },
            toggleRole
        });

        // Mock fetch for environment detection
        global.fetch = vi.fn().mockResolvedValue({
            json: vi.fn().mockResolvedValue({ mode: 'DEVELOPMENT' })
        });

        render(<EnvironmentBadge />);

        // Wait for mode to be displayed
        await waitFor(() => expect(screen.getByText(/common.environment.local/i)).toBeDefined());

        // The popover trigger
        const triggerBtn = await screen.findByText(/Role: Admin/i);
        expect(triggerBtn).toBeDefined();

        // Click to open the popover
        fireEvent.click(triggerBtn);

        // Now the actual switch role button should be visible
        const switchBtn = await screen.findByText(/Switch to User Role/i);
        expect(switchBtn).toBeDefined();

        fireEvent.click(switchBtn);
        expect(toggleRole).toHaveBeenCalled();
    });

    it('should NOT show "Switch Role" button in PRODUCTION', async () => {
        (useAuth as any).mockReturnValue({
            identity: { email: 'prod@mhp.com', name: 'User', isAdmin: false }
        });

        global.fetch = vi.fn().mockResolvedValue({
            json: vi.fn().mockResolvedValue({ mode: 'PRODUCTION' })
        });

        render(<EnvironmentBadge />);

        // Wait for component to load
        await waitFor(() => expect(screen.getByText(/common.environment.production/i)).toBeDefined());

        // Assert role switcher is visible, but we can't switch role
        const triggerBtn = await screen.findByText(/Role: User/i);
        expect(triggerBtn).toBeDefined();

        // Open popover
        fireEvent.click(triggerBtn);

        // Switch button should not be there because toggleRole is undefined
        expect(screen.queryByText(/Switch to /i)).toBeNull();
    });
});
