import axios from 'axios';

// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';

export interface CrawlerJob {
    id: string;
    crawler_id: string;
    status: string;
    start_time: string;
    end_time?: string;
    result?: {
        tenders_found: number;
        tenders_processed: number;
    };
    created_at: string;
}

export interface CrawlerKPISummary {
    total_runs: number;
    successful_runs: number;
    failed_runs: number;
    total_tenders_found: number;
}

export interface CrawlerKPIResponse {
    period: {
        start: string;
        end: string;
    };
    summary: CrawlerKPISummary;
    history: CrawlerJob[];
}

export interface FunnelStats {
    scraped: number;
    manual: number;
    rated: number;
    enriched: number;
    claimed: number;
    bidding: number;
    won: number;
    lost: number;
    no_bid: number;
    high_value: number;
    low_value: number;
    high_low_ratio: number;
    // Disconnected / Legacy keys
    new?: number;
    analyzed?: number;
    interesting?: number;
}

export interface FunnelResponse {
    period: {
        start: string;
        end: string;
    };
    funnel: FunnelStats;
    sources: {
        scraped: number;
        manual: number;
        other: number;
    };
}

export interface TopTendersResponse {
    top_today: any[]; // Using any for Tender model for now
    top_week: any[];
    top_month: any[];
}

export const dashboardApi = {
    getCrawlerKPIs: async (days: number = 7) => {
        const response = await axios.get<CrawlerKPIResponse>(`${API_URL}/api/dashboard/kpis/crawler`, {
            params: { days, _t: Date.now() }
        });
        return response.data;
    },
    getFunnelStats: async (days: number = 7) => {
        const response = await axios.get<FunnelResponse>(`${API_URL}/api/dashboard/kpis/funnel`, {
            params: { days, _t: Date.now() }
        });
        return response.data;
    },
    getTopTenders: async (source?: string, search_text?: string, office_ids?: string[], sector_ids?: string[], service_ids?: string[], ai_status?: string) => {
        const response = await axios.get<TopTendersResponse>(`${API_URL}/api/dashboard/tenders/top`, {
            params: {
                _t: Date.now(),
                source,
                search_text,
                office_ids,
                sector_ids,
                service_ids,
                ai_status
            },
            // Ensure arrays are serialized as multiple params: ?office_ids=1&office_ids=2
            paramsSerializer: {
                indexes: null
            }
        });
        return response.data;
    },
    getTopKeywords: async (days: number = 30) => {
        const response = await axios.get<any[]>(`${API_URL}/api/dashboard/kpis/top-keywords`, {
            params: { days, _t: Date.now() }
        });
        return response.data;
    }
};
