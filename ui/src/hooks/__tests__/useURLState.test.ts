import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useURLState } from '../useURLState';

// Mock window.location
const mockLocation = {
    search: '',
    pathname: '/',
};

Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true,
});

describe('useURLState', () => {
    beforeEach(() => {
        mockLocation.search = '';
        window.history.replaceState = vi.fn();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with default value when URL param is not present', () => {
        const { result } = renderHook(() => useURLState('search', 'default'));
        expect(result.current[0]).toBe('default');
    });

    it('should initialize with URL param value when present', () => {
        mockLocation.search = '?search=test';
        const { result } = renderHook(() => useURLState('search', ''));
        expect(result.current[0]).toBe('test');
    });

    it('should update state and URL when setter is called', () => {
        const { result } = renderHook(() => useURLState('search', ''));

        act(() => {
            result.current[1]('new value');
        });

        expect(result.current[0]).toBe('new value');
        expect(window.history.replaceState).toHaveBeenCalled();
    });

    it('should handle empty string values', () => {
        mockLocation.search = '?search=test';
        const { result } = renderHook(() => useURLState('search', ''));

        act(() => {
            result.current[1]('');
        });

        expect(result.current[0]).toBe('');
    });

    it('should decode URL-encoded values', () => {
        mockLocation.search = '?search=hello%20world';
        const { result } = renderHook(() => useURLState('search', ''));
        expect(result.current[0]).toBe('hello world');
    });

    it('should handle special characters safely', () => {
        const { result } = renderHook(() => useURLState('search', ''));

        act(() => {
            result.current[1]('<script>alert("xss")</script>');
        });

        expect(result.current[0]).toBe('<script>alert("xss")</script>');
        // The value should be stored but will be sanitized when rendered in components
    });
});
