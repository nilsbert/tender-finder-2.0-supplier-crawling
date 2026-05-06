import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';

export interface AIConnectorConfig {
    provider: 'openai' | 'gemini';
    is_active: boolean;
    model: string;
    api_version?: string;
    has_credentials: boolean;
    credential_source?: string;
    available_models?: Array<{ name: string; displayName: string }> | string[];
}

export const aiApi = {
    getConfig: async (provider: 'openai' | 'gemini') => {
        try {
            const response = await axios.get<AIConnectorConfig>(`${API_URL}/ai/config/${provider}`, { timeout: 5000 });
            return response.data;
        } catch {
            return null; // Handle 404 or empty
        }
    },
    getActiveConfig: async () => {
        try {
            const response = await axios.get<AIConnectorConfig>(`${API_URL}/ai/active`);
            return response.data;
        } catch {
            return null;
        }
    },
    saveConfig: async (config: Pick<AIConnectorConfig, 'provider' | 'is_active' | 'model' | 'api_version'>) => {
        const response = await axios.post<boolean>(`${API_URL}/ai/config`, config);
        return response.data;
    },
    testConnection: async (provider: 'openai' | 'gemini') => {
        const response = await axios.post<{ success: boolean; message: string }>(`${API_URL}/ai/test`, { provider });
        return response.data;
    },
    fetchModels: async (provider: 'openai' | 'gemini') => {
        const response = await axios.post<{ models: any[] }>(`${API_URL}/ai/models/${provider}`);
        return response.data.models;
    },
    setCosmosConfig: async (url: string, key: string) => {
        const response = await axios.post(`${API_URL}/config/connection-string`, { url, key }, { timeout: 10000 });
        return response.data;
    },
    getConfigStatus: async () => {
        const response = await axios.get(`${API_URL}/config/status`);
        return response.data;
    },
    enrichTender: async (tenderId: string) => {
        const response = await axios.post<{ success: boolean; message: string }>(`${API_URL}/ai/enrich/${tenderId}`);
        return response.data;
    }
};
