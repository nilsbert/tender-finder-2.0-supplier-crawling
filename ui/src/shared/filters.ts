import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';

export interface FilterOption {
    label: string;
    value: string;
}

export interface FiltersConfig {
    crawled_since_options: FilterOption[];
    due_until_options: FilterOption[];
    rating: {
        min: number;
        max: number;
        step: number;
    };
    keyword_weight: {
        min: number;
        max: number;
        step: number;
    };
    rating_min_presets: FilterOption[];
    audit_presets: Array<{
        label: string;
        min?: number | null;
        max?: number | null;
    }>;
    office_options: FilterOption[];
}

export interface FiltersConfigResponse {
    config: FiltersConfig;
    options: {
        websites: FilterOption[];
        categories: string[];
        keywords: string[];
    };
}

export const getFiltersConfig = async () => {
    const response = await axios.get<FiltersConfigResponse>(`${API_URL}/config/filters`);
    return response.data;
};
