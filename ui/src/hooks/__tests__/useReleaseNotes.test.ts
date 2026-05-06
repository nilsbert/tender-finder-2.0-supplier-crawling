import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useReleaseNotes } from '../useReleaseNotes';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value.toString();
        }),
        clear: vi.fn(() => {
            store = {};
        }),
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

describe('useReleaseNotes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.clear();
        // Default mock response
        vi.stubGlobal('fetch', vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve([
                    { version: '1.3.0', date: '2026-02-05', title: 'Test', changes: ['Init'] }
                ]),
            })
        ));
    });

    it('should fetch and return release notes', async () => {
        const { result } = renderHook(() => useReleaseNotes());

        // Should be in loading state initially
        expect(result.current.loading).toBe(true);

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.versions).toHaveLength(1);
        expect(result.current.versions[0].version).toBe('1.3.0');
    });

    it('should detect new updates based on localStorage', async () => {
        localStorageMock.setItem('tf_last_seen_version', '1.2.0');

        const { result } = renderHook(() => useReleaseNotes());
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.hasNewUpdate).toBe(true);
    });

    it('should mark version as read', async () => {
        const { result } = renderHook(() => useReleaseNotes());
        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => {
            result.current.markAsRead();
        });

        expect(localStorageMock.setItem).toHaveBeenCalledWith('tf_last_seen_version', '1.3.0');
        expect(result.current.hasNewUpdate).toBe(false);
    });

    it('should handle fetch errors gracefully', async () => {
        vi.stubGlobal('fetch', vi.fn(() => Promise.reject('Network Error')));

        const { result } = renderHook(() => useReleaseNotes());
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBe('Unable to load release notes at this time.');
    });
});
