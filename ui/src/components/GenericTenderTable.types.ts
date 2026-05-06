export interface Tender {
    id: string;
    headline: string;
    description?: string;
    caller: string;
    name_website: string;
    rating_total?: number;
    rating_by_category?: Record<string, number>;
    rating_by_type?: Record<string, number>;
    rating_by_subtype?: Record<string, number>;
    published?: string;
    due?: string;
    location?: string;
    url: string;
    additional_links?: string[];
    matched_keywords?: Array<{
        term: string;
        weight?: number;
        impact?: number;
        category?: string;
    }>;
    ai_enriched_at?: string;

    // AI-Enriched Fields (Stage 1)
    headline_ai?: string;
    description_ai?: string;
    caller_ai?: string;
    location_ai?: string;
    published_ai?: string;
    due_ai?: string;
    category_ai?: string;
    tender_type_ai?: string;
    est_volume_ai?: string;
    est_volume?: string;

    enrichment?: {
        ai_short_summary: string;
        ai_summary: string;
        ai_bid_onepager: string;
        locations: string[];
        nearest_office: string;
        processed_at: string;
        model_used: string;
    };
    ai_required_profiles?: string[];
    ai_required_references?: string[];
    ai_required_profiles_meta?: Record<string, unknown>;
    ai_required_references_meta?: Record<string, unknown>;
    ai_profiles?: string[];
    ai_references?: string[];
    ai_profiles_meta?: Record<string, unknown>;
    ai_references_meta?: Record<string, unknown>;
    internal_id?: string;
    external_id?: string;
    crawl_time?: string;
    tender_type?: string;
    cpv_codes?: string[];
    enrichment_summary?: string;
    enrichment_locked?: boolean;
    enrichment_timestamp?: string;
    ai_provider?: string;
}
