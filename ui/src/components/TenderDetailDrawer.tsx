import { type FC, useState } from 'react';
import {PModal} from '@porsche-design-system/components-react';
import { TenderDetailContent } from '../domains/sourcing/components/TenderDetailContent';
import { api } from '../domains/enriching/api';

interface Tender {
    id: string;
    internal_id: string;
    external_id: string;
    headline: string;
    description: string;
    caller: string;
    published: string;
    due?: string;
    name_website: string;
    url: string;
    tender_type?: string;
    cpv_codes?: string[];
    location?: string;
    rating_total?: number;
    rating_by_category?: Record<string, number>;
    matched_keywords?: Array<{
        term: string;
        weight?: number;
        impact?: number;
        category?: string;
    }>;
    // AI-Enriched Fields
    headline_ai?: string;
    caller_ai?: string;
    location_ai?: string;
    published_ai?: string;
    due_ai?: string;
    category_ai?: string;
    tender_type_ai?: string;
    est_volume_ai?: string;

    // Enrichment metadata
    ai_enriched_at?: string;
    enrichment?: {
        ai_short_summary: string;
        ai_summary: string;
        ai_bid_onepager: string;
        locations: string[];
        nearest_office: string;
        model_used: string;
        processed_at: string;
        required_profiles?: string[];
        required_references?: string[];
    };
    enrichment_locked?: boolean;
}

interface TenderDetailDrawerProps {
    tender: Tender | null;
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Detail drawer/modal for displaying comprehensive tender information.
 * Shows enrichment data, audit metadata, ratings, and external link.
 * Opens when user clicks on a tender row.
 */
export const TenderDetailDrawer: FC<TenderDetailDrawerProps> = ({
    tender,
    isOpen,
    onClose,
}) => {
    const [isEnriching, setIsEnriching] = useState(false);

    if (!tender) return null;

    const handleEnrich = async () => {
        if (!tender) return;
        try {
            setIsEnriching(true);
            const idToUse = tender.internal_id || tender.id;
            await api.enrichManual(idToUse);
            console.log('Enrichment triggered for:', idToUse);
        } catch (error) {
            console.error('Enrichment failed:', error);
            alert('Failed to trigger enrichment. Please try again.');
        } finally {
            // Keep loading feedback for 2s
            setTimeout(() => setIsEnriching(false), 2000);
        }
    };

    return (
        <PModal
            open={isOpen}
            onDismiss={onClose}
            dismissButton={true}
            aria={{
                'aria-label': 'Tender Details',
            }}
        >
            <div style={{ padding: '24px' }}>
                <TenderDetailContent
                    tender={tender}
                    onEnrich={handleEnrich}
                    isEnriching={isEnriching}
                />
            </div>
        </PModal>
    );
};
