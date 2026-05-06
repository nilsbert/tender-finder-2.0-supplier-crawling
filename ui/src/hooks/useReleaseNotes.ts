import { useState, useEffect, useCallback } from 'react';
import releaseNotesData from '../config/release-notes.json';

export interface ReleaseNote {
    version: string;
    date: string;
    title: string;
    changes: string[];
}

const LOCAL_STORAGE_KEY = 'tf_last_seen_version';

export const useReleaseNotes = () => {
    const [versions, setVersions] = useState<ReleaseNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasNewUpdate, setHasNewUpdate] = useState(false);

    const fetchNotes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Use imported data instead of fetching
            const data: ReleaseNote[] = releaseNotesData as ReleaseNote[];
            setVersions(data);

            if (data.length > 0) {
                const latestVersion = data[0].version;
                const lastSeen = localStorage.getItem(LOCAL_STORAGE_KEY);
                setHasNewUpdate(lastSeen !== latestVersion);
            }
        } catch (err) {
            console.error('Error loading release notes:', err);
            setError('Unable to load release notes at this time.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const markAsRead = useCallback(() => {
        if (versions.length > 0) {
            const latestVersion = versions[0].version;
            localStorage.setItem(LOCAL_STORAGE_KEY, latestVersion);
            setHasNewUpdate(false);
        }
    }, [versions]);

    return {
        versions,
        loading,
        error,
        hasNewUpdate,
        markAsRead,
        refresh: fetchNotes,
    };
};
