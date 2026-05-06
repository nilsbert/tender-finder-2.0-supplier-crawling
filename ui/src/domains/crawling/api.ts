import axios from 'axios';

// Use Vite environment variable or default to localhost
const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';

// Backend returns Tender model fields (notably `internal_id`); normalize to always expose `id`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeTender = (t: any) => ({
    ...t,
    id: t?.id ?? t?.internal_id,
});

export interface CrawlerConfig {
    user_agent: string;
    ted_austria_url: string;
    ted_austria_max_pages: number;
    ted_switzerland_url: string;
    ted_switzerland_max_pages: number;
    ted_germany_url: string;
    ted_germany_max_pages: number;
    evergabe_base_url_documents: string;
    evergabe_base_url_details: string;
    evergabe_base_search_url: string;
    oeffentliche_vergabe_base_url: string;
    oeffentliche_vergabe_max_pages: number;
    simap_url: string;
    tender24_url: string;
    scrape_evergabe_online: boolean;
    scrape_oeffentliche_vergabe: boolean;
    scrape_ted_austria: boolean;
    scrape_ted_switzerland: boolean;
    scrape_ted_germany: boolean;
    scrape_bund: boolean;
    scrape_simap: boolean;
    scrape_austria: boolean;
    scrape_tender24: boolean;
    stop_at_date?: string;  // Optional ISO date string
    max_tenders?: number;   // Optional maximum number of tenders
    updated_at?: string;
    worker_size?: number;   // Number of concurrent worker processes
}

export const api = {
    getCrawlerConfig: async () => {
        const response = await axios.get<CrawlerConfig>(`${API_URL}/crawler/config`);
        return response.data;
    },
    saveCrawlerConfig: async (config: CrawlerConfig) => {
        const response = await axios.post(`${API_URL}/crawler/config`, config);
        return response.data;
    },
    restartWorkers: async () => {
        const response = await axios.post(`${API_URL}/crawler/workers/restart`);
        return response.data;
    },
    getQueueStatus: async () => {
        const response = await axios.get(`${API_URL}/crawler/queue`);
        return response.data;
    },
    startCrawler: async (crawlerId: string, stopAtDate?: string, maxTenders?: number) => {
        const response = await axios.post(`${API_URL}/crawler/start`, {
            crawler_id: crawlerId,
            stop_at_date: stopAtDate,
            max_tenders: maxTenders
        });
        return response.data;
    },
    getCrawlerStatus: async (crawlerId: string) => {
        const response = await axios.get(`${API_URL}/crawler/status/${crawlerId}`);
        return response.data;
    },
    getConfigStatus: async () => {
        const response = await axios.get(`${API_URL}/config/status`);
        return response.data;
    },
    getScheduleConfig: async () => {
        const response = await axios.get(`${API_URL}/crawler/schedule`);
        return response.data;
    },
    setCosmosConfig: async (url: string, key: string) => {
        const response = await axios.post(`${API_URL}/config/connection-string`, { url, key }, { timeout: 10000 });
        return response.data;
    },
    searchTenders: async (params: {
        search?: string,
        website?: string,
        limit?: number,
        offset?: number,
        crawled_since?: string,
        due_until?: string,
        rating_min?: number,
        rating_max?: number,
        keyword?: string,
        rating_category?: string,
        rating_type?: string,
        rating_subtype?: string,
        rating_category_min?: number,
        has_enrichment?: boolean,
        sort_by?: string,
        sort_dir?: string
    }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await axios.get<any[]>(`${API_URL}/crawler/tenders`, { params });
        return response.data.map(normalizeTender);
    },
    getTender: async (tenderId: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await axios.get<any>(`${API_URL}/crawler/tenders/${tenderId}`);
        return normalizeTender(response.data);
    },
    exportTenders: async (params: {
        search?: string,
        website?: string,
        limit?: number,
        offset?: number,
        crawled_since?: string,
        due_until?: string,
        rating_min?: number,
        rating_max?: number,
        keyword?: string,
        rating_category?: string,
        rating_type?: string,
        rating_subtype?: string,
        rating_category_min?: number,
        has_enrichment?: boolean,
        sort_by?: string,
        sort_dir?: string
    }) => {
        const response = await axios.get(`${API_URL}/crawler/tenders/export`, {
            params,
            responseType: 'blob'
        });
        return response.data;
    },
    getTenderStats: async () => {
        const response = await axios.get(`${API_URL}/crawler/tenders/stats`);
        return response.data;
    },
    getScoreDistribution: async (params?: {
        crawled_since?: string,
        search?: string,
        website?: string,
        keyword?: string,
        rating_category?: string, rating_type?: string, rating_subtype?: string
    }) => {
        const response = await axios.get(`${API_URL}/crawler/dashboard/distribution`, {
            params
        });
        return response.data;
    },
    getTopRatedTenders: async (limit: number = 10, crawledSince?: string, category?: string, type?: string, subtype?: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await axios.get<any[]>(`${API_URL}/crawler/dashboard/top-rated`, {
            params: { limit, crawled_since: crawledSince, category, type, subtype }
        });
        return response.data;
    },
    getDateDistribution: async (params?: {
        crawled_since?: string,
        search?: string,
        website?: string,
        keyword?: string,
        rating_category?: string, rating_type?: string, rating_subtype?: string
    }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await axios.get<any[]>(`${API_URL}/crawler/dashboard/timeline`, {
            params
        });
        return response.data;
    }
};
