import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useURLState<T>(key: string, initialState: T) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [state, setState] = useState<T>(() => {
        const param = searchParams.get(key);
        if (param) {
            try {
                return JSON.parse(param);
            } catch {
                return param as unknown as T;
            }
        }
        return initialState;
    });

    useEffect(() => {
        const value = JSON.stringify(state);
        setSearchParams(prev => {
            prev.set(key, value);
            return prev;
        });
    }, [key, state, setSearchParams]);

    return [state, setState] as const;
}
