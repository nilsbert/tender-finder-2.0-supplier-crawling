import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:8000');
const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

export interface Keyword {
    id: string
    term: string
    weight: number
    type: string // "Service" | "Sector"
    sub_type?: string // Main Category (e.g. Automotive)
    sub_category?: string // Sub Category (e.g. E-Mobility)
    category?: string // Legacy
    created_at: string;
}

export interface KeywordCreate {
    term: string
    weight: number
    type: string
    sub_type?: string
    sub_category?: string
    category?: string
}

export const api = {
    getKeywords: async () => {
        const response = await axios.get<Keyword[]>(`${API_URL}/keywords/`);
        return response.data;
    },
    createKeyword: async (keyword: KeywordCreate) => {
        const response = await axios.post<Keyword>(`${API_URL}/keywords/`, keyword);
        return response.data;
    },
    updateKeyword: async (id: string, keyword: KeywordCreate) => {
        const response = await axios.put<Keyword>(`${API_URL}/keywords/${id}`, keyword);
        return response.data;
    },
    deleteKeyword: async (id: string) => {
        await axios.delete(`${API_URL}/keywords/${id}`);
    },
    getCategories: async () => {
        const response = await axios.get<string[]>(`${API_URL}/keywords/categories`);
        return response.data;
    },
    getKeywordTree: async () => {
        const response = await axios.get<Record<string, string[]>>(`${API_URL}/keywords/tree`);
        return response.data;
    },
    setCosmosConfig: async (url: string, key: string) => {
        const response = await axios.post(`${API_URL}/config/connection-string`, { url, key }, { timeout: 10000 });
        return response.data;
    },
    getConfigStatus: async () => {
        const response = await axios.get(`${API_URL}/config/status`, {
            params: { _t: Date.now() }
        });
        return response.data;
    },
    uploadInitialKeywords: async () => {
        const response = await axios.post(`${API_URL}/keywords/upload/initial`);
        return response.data;
    },
    reRateAllTenders: async () => {
        const response = await axios.post(`${API_URL}/keywords/rerate-all`);
        return response.data;
    },
    exportKeywords: () => {
        // Trigger browser download via invisible anchor to bypass popup blockers
        const link = document.createElement('a');
        link.href = `${API_URL}/keywords/export`;
        link.download = 'keywords_export.yaml';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },
    importKeywords: async (file: File, dryRun: boolean, deleteMissing: boolean) => {
        const formData = new FormData();
        formData.append('file', file);

        // Ensure params are properly encoded
        const params = new URLSearchParams();
        params.append('dry_run', dryRun.toString());
        params.append('delete_missing', deleteMissing.toString());

        const response = await axios.post(`${API_URL}/keywords/import?${params.toString()}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    // Tender Detail Features
    getTender: async (id: string) => {
        const response = await axios.get(`${API_URL}/crawler/tenders/${id}`);
        return response.data;
    },
    deleteTender: async (id: string) => {
        await axios.delete(`${API_URL}/crawler/tenders/${id}`);
    },
    rateTender: async (id: string) => {
        const response = await axios.post(`${API_URL}/keywords/rate/${id}`);
        return response.data;
    },
    enrichTender: async (id: string) => {
        const response = await axios.post(`${API_URL}/enriching/enrich/${id}`);
        return response.data;
    },
    giveFeedback: async (tenderId: string, direction: 'up' | 'down') => {
        const response = await axios.post(`${API_URL}/qualification/feedback/${tenderId}`, null, {
            params: { direction }
        });
        return response.data;
    }
};
