import axios from 'axios';

const rawEnv = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');
const API_BASE = rawEnv.endsWith('/api') ? rawEnv : `${rawEnv}/api`;

export interface ManualUpload {
    id: string;
    tender_id?: string | null;
    file_id: string;
    file_name: string;
    file_size_bytes: number;
    storage_path: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    error_message?: string | null;
    extraction_method?: string;
    extracted_metadata?: Record<string, any> | null;
    user_overrides?: Record<string, any> | null;
    uploaded_by?: string | null;
    uploaded_at?: string;
    processed_at?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface TenderMetadataInput {
    headline: string;
    description?: string | null;
    caller?: string | null;
    location?: string | null;
    due?: string | null;
    published?: string | null;
    est_volume?: string | null;
    tender_type?: string | null;
    cpv_codes?: string[];
    url?: string | null;
    full_text?: string | null;
}

export const manualUploadApi = {
    uploadFile: async (file: File) => {
        const form = new FormData();
        form.append('file', file);
        const response = await axios.post<ManualUpload>(`${API_BASE}/manual-upload/upload`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
    getStatus: async (uploadId: string) => {
        const response = await axios.get<ManualUpload>(`${API_BASE}/manual-upload/${uploadId}`);
        return response.data;
    },
    createTender: async (uploadId: string, metadata: TenderMetadataInput) => {
        const response = await axios.post<{ tender_id: string }>(`${API_BASE}/manual-upload/${uploadId}/create-tender`, metadata);
        return response.data;
    },
    getConfig: async () => {
        const response = await axios.get<{ prompt_template: string }>(`${API_BASE}/manual-upload/config`);
        return response.data;
    },
    saveConfig: async (prompt_template: string) => {
        const response = await axios.post(`${API_BASE}/manual-upload/config`, { prompt_template });
        return response.data;
    }
};
