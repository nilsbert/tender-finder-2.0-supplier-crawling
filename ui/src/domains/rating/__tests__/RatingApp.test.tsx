
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../RatingApp'; // Assuming default export
import { api } from '../api';
import { MemoryRouter } from 'react-router-dom';

// Mock API
vi.mock('../api', () => ({
    api: {
        getKeywords: vi.fn(),
        getCategories: vi.fn(),
        getConfigStatus: vi.fn(),
        createKeyword: vi.fn(),
        updateKeyword: vi.fn(),
        deleteKeyword: vi.fn(),
    }
}));

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
        PButton: ({ children, onClick, type, ...props }: any) => <button onClick={onClick} type={type} {...props}>{children || 'Button'}</button>,
        PTag: ({ children }: any) => <span>{children}</span>,
        PIcon: () => <span>Icon</span>,
        PDivider: () => <hr />,
        PTextFieldWrapper: ({ children }: any) => <div>{children}</div>,
        PModal: ({ children, open, onDismiss, heading }: any) => open ? (
            <div data-testid="p-modal">
                <h2>{heading}</h2>
                <button aria-label="Close" onClick={onDismiss}>X</button>
                {children}
            </div>
        ) : null,
    };
});

// Mock Dnd-Kit (simplistic mock to avoid complex drag logic in unit tests)
vi.mock('@dnd-kit/core', () => ({
    DndContext: ({ children }: any) => <div>{children}</div>,
    useSensor: vi.fn(),
    useSensors: vi.fn(),
    PointerSensor: vi.fn(),
    KeyboardSensor: vi.fn(),
    closestCenter: vi.fn(),
    rectIntersection: vi.fn(),
}));

// Mock sub-components to isolate RatingApp logic
vi.mock('../../../components/ProcessHeader', () => ({
    ProcessHeader: () => <div data-testid="process-header">Header</div>
}));
vi.mock('../../../components/StandardSubNavigation', () => ({
    StandardSubNavigation: ({ children }: any) => <div>{children}</div>,
    StandardSubNavigationItem: ({ label, onClick }: any) => <button onClick={onClick}>{label}</button>
}));
vi.mock('../../../components/StandardPageHeader', () => ({
    StandardPageHeader: ({ children, title }: any) => <div><h1>{title}</h1>{children}</div>
}));
vi.mock('../DraggableKeyword', () => ({
    DraggableKeyword: ({ keyword, onEdit }: any) => (
        <div data-testid={`keyword-${keyword.id}`}>
            <span>{keyword.term}</span>
            <button onClick={() => onEdit(keyword)}>Edit</button>
        </div>
    )
}));
vi.mock('../DroppableGroup', () => ({
    DroppableGroup: ({ children, id }: any) => <div data-testid={id}>{children}</div>
}));
vi.mock('../TrashDropZone', () => ({
    TrashDropZone: () => <div data-testid="trash-zone">Trash</div>
}));

describe('RatingApp Keyword Logic', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        (api.getKeywords as any).mockResolvedValue([]);
        (api.getCategories as any).mockResolvedValue(['IT', 'HR']);
        (api.getConfigStatus as any).mockResolvedValue({ mode: 'disconnected' });
    });

    it('should open modal when Add Keyword is clicked', async () => {
        render(
            <MemoryRouter>
                <App />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText('Rating Keywords')).toBeInTheDocument());

        const addButton = screen.getByText('Add Keyword');
        fireEvent.click(addButton);

        expect(screen.getByTestId('p-modal')).toBeInTheDocument();
        expect(screen.getByText('New Keyword')).toBeInTheDocument();
    });

    it('should create a Service keyword when weight is positive', async () => {
        render(
            <MemoryRouter>
                <App />
            </MemoryRouter>
        );

        // Open Modal
        fireEvent.click(screen.getByText('Add Keyword'));

        // Fill Form
        const modal = screen.getByTestId('p-modal');
        const input = within(modal).getByPlaceholderText(/e.g. Jira/i);
        fireEvent.change(input, { target: { value: 'TestService' } });

        // Set Weight to 2.5 (positive)
        const slider = within(modal).getByRole('slider', { hidden: true }) || within(modal).getByDisplayValue('1'); // Initial value 1
        fireEvent.change(slider, { target: { value: '2.5' } });

        // Submit
        const saveButton = within(modal).getByText('Add Keyword');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(api.createKeyword).toHaveBeenCalledWith(expect.objectContaining({
                term: 'TestService',
                weight: 2.5,
                type: 'Service' // Should default to Service or be derived
            }));
        });
    });

    it('should create an Exclusion keyword when weight is negative', async () => {
        render(
            <MemoryRouter>
                <App />
            </MemoryRouter>
        );

        // Open Modal
        fireEvent.click(screen.getByText('Add Keyword'));

        // Fill Form
        const modal = screen.getByTestId('p-modal');
        const input = within(modal).getByPlaceholderText(/e.g. Jira/i);
        fireEvent.change(input, { target: { value: 'TestExclusion' } });

        // Set Weight to -3.0 (negative)
        // Note: We need to find the range input. Testing Library uses getByRole('slider') usually.
        // Assuming the input type="range" is accessible.
        // If not found by role, we might need a direct query or ensure the mock renders it correctly.
        // The mock for PTextFieldWrapper just renders children, so proper input should be there.
        const slider = modal.querySelector('input[type="range"]'); // Direct DOM query for range input if role fails
        if (!slider) throw new Error("Slider not found");

        fireEvent.change(slider, { target: { value: '-3' } });

        // Function logic check: Verify the derived payload
        const saveButton = within(modal).getByText('Add Keyword');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(api.createKeyword).toHaveBeenCalledWith(expect.objectContaining({
                term: 'TestExclusion',
                weight: -3,
                type: 'Exclusion' // Should be derived from negative weight
            }));
        });
    });

    it('should not close modal when clicking the slider (stop propagation check)', async () => {
        render(
            <MemoryRouter>
                <App />
            </MemoryRouter>
        );

        // Open Modal
        fireEvent.click(screen.getByText('Add Keyword'));
        const modal = screen.getByTestId('p-modal');
        const slider = modal.querySelector('input[type="range"]');
        if (!slider) throw new Error("Slider not found");

        // Click on slider - should NOT trigger onDismiss
        // We can't easily test stopPropagation logic in JSDOM the same way as browser,
        // but we can verify the modal remains open.
        fireEvent.click(slider);
        fireEvent.mouseDown(slider);

        expect(screen.getByTestId('p-modal')).toBeInTheDocument();

        // Click X should close it
        const closeButton = within(modal).getByText('X');
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByTestId('p-modal')).not.toBeInTheDocument();
        });
    });
});
