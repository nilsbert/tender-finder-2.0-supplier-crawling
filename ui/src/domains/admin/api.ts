import axios from 'axios';

// Use environment variable or default to localhost, then append /api prefix
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';
const API_URL = `${BASE_URL}/api`;

export interface RatingPolicyConfig {
    overall_threshold: number;
    title_threshold: number;
    last_updated_at?: string;
}

export interface RetentionConfig {
    retention_days: number;
    last_updated_at?: string;
}

export interface CleanupStats {
    message: string;
    deleted_count: number;
    executed_at: string;
}

export const adminApi = {
    getRatingConfig: async () => {
        const response = await axios.get<RatingPolicyConfig>(`${API_URL}/admin/rating`);
        return response.data;
    },
    updateRatingConfig: async (config: RatingPolicyConfig) => {
        const response = await axios.post<RatingPolicyConfig>(`${API_URL}/admin/rating`, config);
        return response.data;
    },
    getContractInfoTenders: async (limit: number = 50, offset: number = 0) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await axios.get<any[]>(`${API_URL}/admin/tenders/contract-info`, { params: { limit, offset } });
        // Normalize tender_id to id for the frontend
        return response.data.map(t => ({
            ...t,
            id: t.id ?? t.tender_id
        }));
    },
    reclassifyTender: async (tenderId: string, status: string, reason?: string) => {
        const response = await axios.patch(`${API_URL}/admin/tenders/${tenderId}/status`, { status, reason });
        return response.data;
    },
    getRetentionConfig: async () => {
        const response = await axios.get<RetentionConfig>(`${API_URL}/admin/retention`);
        return response.data;
    },
    updateRetentionConfig: async (config: { retention_days: number }) => {
        const response = await axios.post<RetentionConfig>(`${API_URL}/admin/retention`, config);
        return response.data;
    },
    triggerCleanup: async () => {
        const response = await axios.post<CleanupStats>(`${API_URL}/admin/retention/trigger`);
        return response.data;
    }
};
