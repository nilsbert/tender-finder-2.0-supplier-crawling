import { renderHook, act } from '@testing-library/react';
import { useSavedViews } from '../useSavedViews';
import { vi, describe, beforeEach, it, expect } from 'vitest';

/**
 * @logic Saved View Persistence
 * @requirement feat-067-sourcing-list-worktop
 */
describe('Logic: Saved View Persistence', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    /**
     * @rule "Default View" is created if none exists
     * @output SavedViews.length === 1
     * @value Birgit starts with a clean setup
     */
    describe('Rule: Default View Initialization', () => {
        it('should create a default "Today" view on first initialization', () => {
            const { result } = renderHook(() => useSavedViews());
            expect(result.current.views.length).toBe(1);
            expect(result.current.views[0].name).toBe('Published: Today');
        });
    });

    /**
     * @rule "LocalStorage Full" is handled gracefully
     * @input Mock LocalStorage throw QuotaExceededError
     * @value System robustness
     */
    describe('Rule: Storage Limits', () => {
        it('should notify the user when LocalStorage is full', () => {
            const spySet = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw { name: 'QuotaExceededError' };
            });

            const { result } = renderHook(() => useSavedViews());
            act(() => {
                result.current.saveView({ name: 'Overflow', filters: {}, columns: [] });
            });

            expect(result.current.error).toContain('Storage limit');
            spySet.mockRestore();
        });
    });
});
