import axios from 'axios';

// Use environment variable or default to localhost
const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api';

export interface EnrichmentConfig {
    enrichment_threshold: number;
    enrichment_worker_count: number;
    prompt_tender_status_detection: string;
    prompt_field_enrichment: string;
    prompt_summary_generation: string;
    prompt_bid_team_onepager: string;
    prompt_office_matching: string;
    profile_requirements_enabled: boolean;
    prompt_profile_requirements: string;
    max_profile_requirements: number;
    model_profile_requirements?: string | null;
    reference_requirements_enabled: boolean;
    prompt_reference_requirements: string;
    max_reference_requirements: number;
    model_reference_requirements?: string | null;
    prompt_chat_with_tender: string;
    label_matching_enabled: boolean;
    prompt_label_matching: string;
    prompt_distribution_matching: string;
}

export interface QueueItem {
    tender_id: string;
    headline: string;
    status: string; // QUEUED, PROCESSING, FAILED_...
    error?: string;
    enqueued_at?: string;
}

export interface EnrichmentStatus {
    queue_depth: number;
    active_workers: number;
    failed_count: number;
    rate_limit_paused: boolean;
    total_processed: number;
    pending_count: number;
}

export const api = {
    getConfig: async () => {
        const response = await axios.get<EnrichmentConfig>(`${API_URL}/enriching/config`);
        return response.data;
    },
    saveConfig: async (config: EnrichmentConfig) => {
        const response = await axios.post<EnrichmentConfig>(`${API_URL}/enriching/config`, config);
        return response.data;
    },
    startBatch: async (force: boolean = false) => {
        const response = await axios.post(`${API_URL}/enriching/start`, { force });
        return response.data;
    },
    enrichManual: async (tenderId: string) => {
        const response = await axios.post(`${API_URL}/enriching/enrich/${tenderId}`);
        return response.data;
    },
    getStatus: async () => {
        const response = await axios.get<EnrichmentStatus>(`${API_URL}/enriching/status`);
        return response.data;
    },
    getQueue: async () => {
        const response = await axios.get<QueueItem[]>(`${API_URL}/enriching/queue`);
        return response.data;
    },
    retryTender: async (tenderId: string) => {
        const response = await axios.post(`${API_URL}/enriching/retry/${tenderId}`);
        return response.data;
    },
    getEnrichmentConfig: async () => {
        const response = await axios.get<EnrichmentConfig>(`${API_URL}/enriching/config`);
        return response.data; // EnrichmentConfig
    },

    chatWithTender: async (tenderId: string, history: Array<{ role: string, content: string }>, question: string) => {
        const response = await axios.post<{ answer: string }>(`${API_URL}/enriching/chat/${tenderId}`, {
            history,
            question
        });
        return response.data; // { answer: string }
    },
    retryAllFailed: async () => {
        const response = await axios.post(`${API_URL}/enriching/retry/all`);
        return response.data;
    }
};
