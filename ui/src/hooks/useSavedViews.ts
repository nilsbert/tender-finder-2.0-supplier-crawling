import { useState, useEffect, useCallback } from 'react';

export interface SavedView {
    id: string;
    name: string;
    search: string;
    website?: string;
    office_ids?: string[];
    sector_ids?: string[];
    service_ids?: string[];
    published_min?: string;
    published_max?: string;
    columns: string[];
}

const STORAGE_KEY = 'tender_finder_saved_views';

export const useSavedViews = () => {
    const [views, setViews] = useState<SavedView[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Initialize with "Published Today" if empty
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setViews(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse saved views', e);
                setError('Failed to load saved views');
            }
        } else {
            const defaultView: SavedView = {
                id: 'default-today',
                name: 'Published: Today',
                search: '',
                columns: ['title', 'source_system', 'published_at', 'deadline_at', 'score'],
            };
            setViews([defaultView]);
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify([defaultView]));
            } catch (e: any) {
                if (e.name === 'QuotaExceededError' || e.message?.includes('quota')) {
                    setError('Storage limit reached during initialization');
                }
            }
        }
    }, []);

    const saveView = useCallback((viewData: Omit<SavedView, 'id'>) => {
        try {
            const newView: SavedView = {
                ...viewData,
                id: crypto.randomUUID(),
            };
            const updatedViews = [...views, newView];
            setViews(updatedViews);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedViews));
            setError(null);
        } catch (e: any) {
            if (e.name === 'QuotaExceededError' || e.message?.includes('quota')) {
                setError('Storage limit reached. Please delete old views.');
            } else {
                setError('Failed to save view');
            }
        }
    }, [views]);

    const deleteView = useCallback((id: string) => {
        const updatedViews = views.filter(v => v.id !== id);
        setViews(updatedViews);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedViews));
    }, [views]);

    return {
        views,
        error,
        saveView,
        deleteView,
    };
};
