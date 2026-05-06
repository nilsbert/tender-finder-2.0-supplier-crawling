import axios from 'axios';

const API_URL = '/api'; // Use relative path to go through Vite proxy

export interface Keyword {
    id: string;
    term: string;
    weight: number;
    category?: string;
    created_at: string;
}

export interface KeywordCreate {
    term: string;
    weight: number;
    category?: string;
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
    setCosmosConfig: async (url: string, key: string) => {
        const response = await axios.post(`${API_URL}/config/connection-string`, { url, key });
        return response.data;
    },
    getConfigStatus: async () => {
        const response = await axios.get(`${API_URL}/config/status`);
        return response.data;
    }
};
