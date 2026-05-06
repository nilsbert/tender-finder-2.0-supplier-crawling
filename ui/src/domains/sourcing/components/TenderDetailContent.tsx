import { type FC, useMemo, useState } from 'react';
import {PGrid,
    PGridItem,
    PHeading,
    PText,
    PTag,
    PDivider,
    PLink,
    PFlex,
    PFlexItem,
    PButton,
    PTabs,
    PTabsItem,
    PButtonPure} from '@porsche-design-system/components-react';
import './TenderDetailContentMarkdown.css'; // We will create this file for print styles
import { AiBidOnePager } from '../../../components/AiBidOnePager';
import { TenderChat } from './TenderChat';
import { distributingApi, ActiveChannel } from '../../distributing/api/distributingApi';
import { useEffect } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Tender = any;

const isIsoDateTime = (value: string) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
const isIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);
const humanizeKey = (key: string) =>
    key
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

const flattenObject = (value: unknown) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const entries = Object.entries(value as Record<string, unknown>);
    return entries.length ? entries : null;
};

const ValueView: FC<{ value: unknown; isScrollable?: boolean }> = ({ value, isScrollable }) => {
    if (value === null || value === undefined) return <PText size="small" color="contrast-medium">—</PText>;

    if (typeof value === 'string') {
        const text = value.trim();
        if (text.startsWith('http://') || text.startsWith('https://')) {
            return <PLink href={text} target="_blank" icon="external">{text}</PLink>;
        }
        if (isIsoDateTime(text)) {
            return <PText size="small">{new Date(text).toLocaleString('de-DE')}</PText>;
        }
        if (isIsoDate(text)) {
            return <PText size="small">{new Date(text).toLocaleDateString('de-DE')}</PText>;
        }
        if (isScrollable) {
            return (
                <div style={{ maxHeight: '200px', overflowY: 'auto', backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '4px', border: '1px solid #eee' }}>
                    <PText size="small" style={{ whiteSpace: 'pre-line' }}>{text}</PText>
                </div>
            );
        }
        const isLong = text.length > 280 || text.includes('\n');
        if (!isLong) return <PText size="small">{text}</PText>;
        return <PText size="small" style={{ whiteSpace: 'pre-line' }}>{text}</PText>;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return <PText size="small">{String(value)}</PText>;
    }

    if (Array.isArray(value)) {
        if (value.length === 0) return <PText size="small" color="contrast-medium">—</PText>;
        const allPrimitives = value.every((v) => ['string', 'number', 'boolean'].includes(typeof v));
        if (allPrimitives) {
            return (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {value.map((v, idx) => (
                        <PTag key={`${String(v)}-${idx}`}>{String(v)}</PTag>
                    ))}
                </div>
            );
        }
        return <PText size="small" color="contrast-medium">{value.length} items</PText>;
    }

    const flattened = flattenObject(value);
    if (!flattened) return <PText size="small" color="contrast-medium">—</PText>;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {flattened.slice(0, 20).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: '10px' }}>
                    <PText size="x-small" color="contrast-medium" style={{ width: '180px', flex: '0 0 180px', wordBreak: 'break-word' }}>
                        {humanizeKey(k)}
                    </PText>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <ValueView value={v} />
                    </div>
                </div>
            ))}
            {flattened.length > 20 && (
                <PText size="x-small" color="contrast-medium">…{flattened.length - 20} more</PText>
            )}
        </div>
    );
};

const FieldGrid: FC<{
    data: Record<string, unknown> | null | undefined;
    labelMap?: Record<string, string>;
    preferredOrder?: string[];
}> = ({ data, labelMap, preferredOrder }) => {
    const entries = useMemo(() => {
        if (!data) return [];

        let processedEntries = Object.entries(data);

        // HARD FILTER: Remove 'db_tables' and 'crawl_time'
        processedEntries = processedEntries.filter(([key]) => {
            const normalizedKey = key.toLowerCase().trim();
            return normalizedKey !== 'db_tables' && normalizedKey !== 'db_table' && normalizedKey !== 'crawl_time';
        });

        // Strict Allowlist filtering if preferredOrder is present
        if (preferredOrder && preferredOrder.length > 0) {
            const allowed = new Set(preferredOrder);
            processedEntries = processedEntries.filter(([key]) => allowed.has(key));

            // Sort by preferred order
            processedEntries.sort(([a], [b]) => {
                const idxA = preferredOrder.indexOf(a);
                const idxB = preferredOrder.indexOf(b);
                return idxA - idxB;
            });
        } else {
            // Default sort
            processedEntries.sort(([a], [b]) => {
                const la = (labelMap?.[a] ?? humanizeKey(a)).toLowerCase();
                const lb = (labelMap?.[b] ?? humanizeKey(b)).toLowerCase();
                return la.localeCompare(lb);
            });
        }

        return processedEntries;
    }, [data, preferredOrder, labelMap]);

    if (!data || entries.length === 0) return <PText size="small" color="contrast-medium">No data available.</PText>;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '10px 16px' }}>
            {entries.map(([key, value]) => (
                <div key={key} style={{ display: 'contents' }}>
                    <PText size="x-small" color="contrast-medium" style={{ wordBreak: 'break-word' }}>
                        {labelMap?.[key] ?? humanizeKey(key)}
                    </PText>
                    <div style={{ minWidth: 0 }}>
                        <ValueView value={value} isScrollable={key === 'full_text'} />
                    </div>
                </div>
            ))}
        </div>
    );
};

interface TenderDetailContentProps {
    tender: Tender;
    onEnrich?: () => void;
    isEnriching?: boolean;
    onScore?: () => void;
    isScoring?: boolean;
    onSendToTeams?: () => void;
    isSendingToTeams?: boolean;
    onFeedback?: (direction: 'up' | 'down') => void;
}

export const TenderDetailContent: FC<TenderDetailContentProps> = ({ tender, onEnrich, isEnriching, onScore, isScoring, onSendToTeams, isSendingToTeams, onFeedback }) => {
    if (!tender) return null;
    const [activeTab, setActiveTab] = useState(0);
    const [isZipping, setIsZipping] = useState(false);
    const [activeChannels, setActiveChannels] = useState<ActiveChannel[]>([]);
    const [loadingChannels, setLoadingChannels] = useState(false);
    const [sendingChannelId, setSendingChannelId] = useState<string | null>(null);
    const [matchedOffice, setMatchedOffice] = useState<any>(null);
    const [allLabels, setAllLabels] = useState<any[]>([]);

    useEffect(() => {
        // Fetch active channels only once or when tab changes? 
        // Let's fetch once on mount to be ready
        const fetchChannels = async () => {
            setLoadingChannels(true);
            try {
                const channels = await distributingApi.getActiveChannels();
                setActiveChannels(channels);
            } catch (e) {
                console.error("Failed to load active channels", e);
            } finally {
                setLoadingChannels(false);
            }
        };
        fetchChannels();

        // Fetch all labels for categorization
        const fetchLabels = async () => {
            try {
                const labels = await distributingApi.getLabels();
                setAllLabels(labels);
            } catch (e) {
                console.error("Failed to load labels", e);
            }
        };
        fetchLabels();
    }, []);

    useEffect(() => {
        // Fetch matched office details if available
        const fetchMatchedOffice = async () => {
            const officeId = tender?.enrichment?.matched_office_id;
            if (officeId) {
                try {
                    const offices = await distributingApi.getOffices();
                    const office = offices.find(o => o.id === officeId);
                    setMatchedOffice(office);
                } catch (e) {
                    console.error("Failed to load matched office", e);
                }
            }
        };
        fetchMatchedOffice();
    }, [tender?.enrichment?.matched_office_id]);

    const handleSendToChannel = async (channel: ActiveChannel) => {
        setSendingChannelId(channel.id);
        try {
            await distributingApi.distributeTender(tender.id || tender.internal_id, true, {
                id: channel.id,
                type: channel.type
            });
            alert(`Successfully sent to ${channel.name}`);
        } catch (e) {
            console.error(e);
            alert("Failed to send: " + e);
        } finally {
            setSendingChannelId(null);
        }
    };

    const handleDownloadZip = async () => {
        if (!tender.documents || tender.documents.length === 0) return;

        setIsZipping(true);
        try {
            // Assuming API base is relative or configured
            // URL: /api/crawler/tenders/{id}/documents/zip
            const tenderId = tender.id || tender.internal_id; // Prefer ID if available
            // If tender.id is missing (crawler object), check what Route expects. Route expects tender_id (DB ID)
            // If the tender object here is from DB, it has 'id'.
            // If we are browsing live crawl results (not persisted yet?), this might fail.
            // But documents are only populated after crawl & persist.

            const response = await fetch(`/api/crawler/tenders/${tender.id}/documents/zip`);
            if (!response.ok) throw new Error("Download failed");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${tender.external_id || 'tender'}_documents.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (e) {
            console.error("ZIP download failed", e);
            alert("Failed to download ZIP. Please try again.");
        } finally {
            setIsZipping(false);
        }
    };

    const formatDate = (dateString?: string) => {
        // ... (keep logic)
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const hasAiEnrichment = !!tender.ai_enriched_at;
    const dbTables = (tender as Record<string, unknown>)?.db_tables as Record<string, unknown> | undefined;
    const dbTender = (dbTables?.tenders as Record<string, unknown> | undefined) ?? null;
    const dbRating = (dbTables?.tender_ratings as Record<string, unknown> | undefined) ?? null;
    const dbEnrichment = (dbTables?.tender_enrichment as Record<string, unknown> | undefined) ?? null;

    const sourcingData = useMemo(() => {
        const { db_tables, ...tenderWithoutDb } = tender as any;
        const combined = { ...tenderWithoutDb, ...(dbTender ?? {}) };

        // Remove rating/score fields from sourcing view
        const {
            score,
            rating_total,
            rating_by_category,
            rating_by_type,
            rating_by_subtype,
            rating_by_subcategory,
            matched_keywords,
            // db_tables removed already

            ...rest
        } = combined;
        return rest;
    }, [tender, dbTender]);

    const ratingData = useMemo(() => {
        const combined = { ...tender, ...(dbRating ?? {}) } as any;
        const { db_tables, created_at, matched_keywords, ...rest } = combined;

        let processedKeywords = matched_keywords;
        if (Array.isArray(matched_keywords) && matched_keywords.length > 0) {
            processedKeywords = matched_keywords.map((k: any) => {
                if (typeof k === 'object' && k.term) {
                    return `${k.term} (${k.score > 0 ? '+' : ''}${k.score})`;
                }
                return String(k);
            });
        }

        return {
            ...rest,
            matched_keywords: processedKeywords,
            rated_at: created_at // Rename created_at to rated_at for this view
        };
    }, [tender, dbRating]);

    const enrichingData = useMemo(() => {
        const combined = { ...tender, ...(dbEnrichment ?? {}) } as any;
        const { db_tables, result, ai_enriched_at, ...rest } = combined;

        // Extract fields from result or tender.enrichment
        const enrichmentSource = result || tender.enrichment || {};

        return {
            ...rest,
            ai_summary: enrichmentSource.ai_summary,
            est_volume_ai: enrichmentSource.est_volume_ai,
            required_profiles: enrichmentSource.required_profiles,
            required_references: enrichmentSource.required_references,
            enriched_at: ai_enriched_at // Rename for view
        };
    }, [tender, dbEnrichment]);

    const sourcingLabelMap: Record<string, string> = {
        id: 'ID',
        internal_id: 'Internal ID',
        external_id: 'External ID',
        title: 'Title',
        headline: 'Headline',
        description: 'Description',
        full_text: 'Full Text',
        published_at: 'Published At',
        deadline_at: 'Submission Deadline',
        crawl_time: 'Time of Crawling',
        created_at: 'Created At',
        updated_at: 'Updated At',
        source_system: 'Source Website',
        source_url: 'Source URL',
        url: 'Source URL',
        contact_name: 'Contact Name',
        contact_email: 'Contact Email',
        contact_json: 'Contact (Details)',
        source_metadata: 'Source Metadata',
        status: 'Status',
    };

    const ratingLabelMap: Record<string, string> = {
        id: 'ID',
        tender_id: 'Tender ID',
        score: 'Overall Score',
        rating_title: 'Title Score',
        matched_keywords: 'Matched Keywords',
        rating_by_category: 'Matched Sectors or Solutions',
        rated_at: 'Rated At',
    };

    const enrichingLabelMap: Record<string, string> = {
        id: 'ID',
        tender_id: 'Tender ID',
        ai_summary: 'AI Summary',
        est_volume_ai: 'Estimated Volume',
        required_profiles: 'Required Profiles',
        required_references: 'Required References',
        service_metadata: 'Service Metadata',
        enriched_at: 'Enriched At',
        result: 'Raw Result', // Fallback
    };

    const sourcingPreferred = [
        'id',
        'internal_id',
        'external_id',
        'title',
        'description',
        'full_text',
        'published_at',
        'deadline_at',
        'created_at',
        'updated_at',
        'status',
        'contact_name',
        'contact_email',
        'contact_json',
        'source_system',
        'source_url',
        'source_metadata'
    ];
    const ratingPreferred = ['id', 'tender_id', 'score', 'rating_title', 'matched_keywords', 'rating_by_category', 'rated_at'];
    const enrichingPreferred = [
        'id',
        'tender_id',
        'ai_summary',
        'est_volume_ai',
        'required_profiles',
        'required_references',
        'service_metadata',
        'enriched_at'
    ];

    return (
        <PFlex direction="column" style={{ gap: '2rem' }}>
            {/* Header Section */}
            <PFlexItem>
                <PFlex justifyContent="space-between" alignItems="flex-start">
                    <div style={{ flex: 1 }}>
                        <PFlex alignItems="center" style={{ gap: '1rem', marginBottom: '0.5rem' }}>
                            <PTag color="background-base">{tender.name_website}</PTag>
                            {hasAiEnrichment && <PTag icon="star" color="notification-info-soft">AI Enriched</PTag>}
                            {tender.ai_status === 'contract_information' && <PTag color="notification-warning" icon="information">Contract Award</PTag>}
                            {tender.tender_type && <PTag color="background-surface">{tender.tender_type}</PTag>}
                        </PFlex>
                        <PHeading size="large" style={{ marginTop: '0.5rem' }}>
                            {hasAiEnrichment && tender.headline_ai ? tender.headline_ai : tender.headline}
                        </PHeading>
                        {hasAiEnrichment && tender.headline_ai && (
                            <PText color="contrast-medium" size="small" style={{ marginTop: '0.25rem' }}>
                                Original: {tender.headline}
                            </PText>
                        )}
                    </div>

                    {(onEnrich || onScore) && (
                        <div style={{ marginLeft: '1rem' }}>
                            <PFlex style={{ gap: '0.75rem' }}>
                                {onEnrich && (
                                    <PButton
                                        variant="secondary"
                                        icon="star"
                                        loading={isEnriching}
                                        onClick={onEnrich}
                                    >
                                        {hasAiEnrichment ? 'Re-Enrich' : 'Enrich Tender'}
                                    </PButton>
                                )}
                                {onScore && (
                                    <PButton variant="secondary" icon="star" loading={isScoring} onClick={onScore}>
                                        Score Again
                                    </PButton>
                                )}
                                {onSendToTeams && (
                                    <PButton variant="secondary" icon="chat" loading={isSendingToTeams} onClick={onSendToTeams}>
                                        Send to MS Teams
                                    </PButton>
                                )}
                            </PFlex>
                        </div>
                    )}
                </PFlex>
            </PFlexItem>

            <PDivider />

            <PTabs activeTabIndex={activeTab} onTabChange={(e: CustomEvent) => setActiveTab(e.detail.activeTabIndex)}>
                <PTabsItem label="Overview">
                    <div style={{ padding: '16px 0' }}>
                        {/* Main Content Grid */}
                        <PGrid gutter={16}>
                            {/* Left Column: Description & AI Content */}
                            <PGridItem size={{ base: 12, l: 8 }}>
                                <PFlex direction="column" style={{ gap: '2rem' }}>

                                    {/* AI Summary Section */}
                                    {hasAiEnrichment && tender.enrichment?.ai_summary && (
                                        <div style={{ backgroundColor: '#f2f2f2', padding: '1.5rem', borderRadius: '4px' }}>
                                            <PFlex alignItems="center" style={{ gap: '0.5rem', marginBottom: '1rem' }}>
                                                <span style={{ fontSize: '1.25rem' }}>✨</span>
                                                <PHeading size="medium">AI Summary</PHeading>
                                            </PFlex>
                                            <PText style={{ whiteSpace: 'pre-line' }}>{tender.enrichment.ai_summary}</PText>

                                            {tender.enrichment.est_volume_ai && (
                                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
                                                    <PText size="small" style={{ fontWeight: 'bold' }}>Estimated Volume:</PText>
                                                    <PText>{tender.enrichment.est_volume_ai}</PText>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Original Description */}
                                    <div>
                                        <PHeading size="medium" style={{ marginBottom: '1rem' }}>Original Description</PHeading>
                                        <PText style={{ whiteSpace: 'pre-line', color: '#555' }}>
                                            {tender.description}
                                        </PText>
                                    </div>
                                </PFlex>
                            </PGridItem>

                            {/* Right Column: Key Facts & Metadata */}
                            <PGridItem size={{ base: 12, l: 4 }}>
                                <div style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '1.5rem' }}>
                                    <PHeading size="small" style={{ marginBottom: '1.5rem' }}>Key Facts</PHeading>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        {/* Identifiers */}
                                        <div style={{ marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f0f0f0' }}>
                                            <PText size="x-small" color="contrast-medium">Ref ID: {tender.external_id || tender.internal_id}</PText>
                                        </div>

                                        {/* Award Data Section */}
                                        {tender.ai_status === 'contract_information' && (
                                            <div style={{ marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f0f0f0' }}>
                                                <PText size="small" color="contrast-medium" style={{ marginBottom: '0.25rem' }}>Contract Information</PText>
                                                {tender.enrichment?.awarded_contractor && (
                                                    <div style={{ marginTop: '0.5rem' }}>
                                                        <PText size="x-small" color="contrast-medium">Awarded Contractor</PText>
                                                        <PText style={{ fontWeight: 'bold' }}>{tender.enrichment.awarded_contractor}</PText>
                                                    </div>
                                                )}
                                                {tender.enrichment?.contract_value && (
                                                    <div style={{ marginTop: '0.5rem' }}>
                                                        <PText size="x-small" color="contrast-medium">Contract Value</PText>
                                                        <PText>{tender.enrichment.contract_value}</PText>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div>
                                            <PText size="small" color="contrast-medium" style={{ marginBottom: '0.25rem' }}>Caller / Authority</PText>
                                            <PText style={{ fontWeight: 'bold' }}>{tender.caller}</PText>
                                            {hasAiEnrichment && tender.caller_ai && tender.caller_ai !== tender.caller && (
                                                <PText size="x-small" color="notification-info">(AI: {tender.caller_ai})</PText>
                                            )}
                                        </div>

                                        <div>
                                            <PText size="small" color="contrast-medium" style={{ marginBottom: '0.25rem' }}>Publication Date</PText>
                                            <PText>{formatDate(tender.published)}</PText>
                                        </div>

                                        <div>
                                            <PText size="small" color="contrast-medium" style={{ marginBottom: '0.25rem' }}>Submission Due</PText>
                                            <PText style={{ color: tender.due ? 'var(--tf-accent)' : 'inherit', fontWeight: tender.due ? 'bold' : 'normal' }}>
                                                {formatDate(tender.due)}
                                            </PText>
                                        </div>

                                        <div>
                                            <PText size="small" color="contrast-medium" style={{ marginBottom: '0.25rem' }}>Location</PText>
                                            <PText>{tender.location || 'Not specified'}</PText>
                                            {hasAiEnrichment && tender.location_ai && tender.location_ai !== tender.location && (
                                                <PText size="x-small" color="notification-info">(AI: {tender.location_ai})</PText>
                                            )}
                                            {hasAiEnrichment && tender.enrichment?.nearest_office && (
                                                <div style={{ marginTop: '0.25rem' }}>
                                                    <PTag color="background-surface">Nearest Office: {tender.enrichment.nearest_office}</PTag>
                                                </div>
                                            )}
                                        </div>

                                        {/* Volume Section */}
                                        {(tender.est_volume || (hasAiEnrichment && tender.enrichment?.est_volume_ai)) && (
                                            <div>
                                                <PText size="small" color="contrast-medium" style={{ marginBottom: '0.25rem' }}>Est. Volume</PText>
                                                {tender.est_volume && <PText>{tender.est_volume}</PText>}
                                                {hasAiEnrichment && tender.enrichment?.est_volume_ai && (
                                                    <PText size="small" color="notification-info">AI Est: {tender.enrichment.est_volume_ai}</PText>
                                                )}
                                            </div>
                                        )}

                                        {tender.cpv_codes && tender.cpv_codes.length > 0 && (
                                            <div>
                                                <PText size="small" color="contrast-medium" style={{ marginBottom: '0.5rem' }}>CPV Codes</PText>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                    {tender.cpv_codes.map((code: string) => (
                                                        <PTag key={code}>{code}</PTag>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <PText size="small" color="contrast-medium" style={{ marginBottom: '0.25rem' }}>Source Link</PText>
                                            {tender.url ? (
                                                <PLink href={tender.url} target="_blank" icon="external">View Original Tender</PLink>
                                            ) : (
                                                <PText>-</PText>
                                            )}
                                        </div>

                                        <div>
                                            <PText size="small" color="contrast-medium" style={{ marginBottom: '0.25rem' }}>Crawled At</PText>
                                            <PText size="small">{formatDate(tender.crawl_time || tender.published)}</PText>
                                        </div>

                                        <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem', marginTop: '0.5rem' }}>
                                            <PText size="small" color="contrast-medium" style={{ marginBottom: '0.25rem' }}>Enrichment Info</PText>
                                            <PText size="small" color="notification-success">Status: {tender.enrichment_status || 'COMPLETED'}</PText>
                                            {tender.ai_enriched_at && <PText size="x-small" color="contrast-medium">Last: {new Date(tender.ai_enriched_at).toLocaleString()}</PText>}
                                        </div>
                                    </div>
                                </div>

                                {/* Rating Overview if exists */}
                                {tender.rating_total !== undefined && (
                                    <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                                        <PHeading size="small" style={{ marginBottom: '1rem' }}>Qualification Rating</PHeading>

                                        <PFlex alignItems="center" justifyContent="space-between" style={{ marginBottom: '1rem' }}>
                                            <PText>Overall Score</PText>
                                            <PHeading size="large" style={{ color: tender.rating_total > 0 ? '#1b7e28' : 'var(--tf-danger)' }}>
                                                {tender.rating_total}
                                            </PHeading>
                                        </PFlex>

                                        {tender.rating_title !== undefined && (
                                            <PFlex alignItems="center" justifyContent="space-between" style={{ marginBottom: '1rem', borderTop: '1px solid #f0f0f0', paddingTop: '1rem' }}>
                                                <PText>Title Score</PText>
                                                <PHeading size="large" style={{ color: tender.rating_title > 0 ? '#1b7e28' : 'var(--tf-contrast-medium)' }}>
                                                    {tender.rating_title}
                                                </PHeading>
                                            </PFlex>
                                        )}

                                        {tender.rating_by_category && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {Object.entries(tender.rating_by_category).map(([cat, score]) => (
                                                    <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                                        <span>{cat}</span>
                                                        <strong>{String(score)}</strong>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </PGridItem>
                        </PGrid>
                    </div>
                </PTabsItem>

                <PTabsItem label="Chat with the Tender">
                    <div style={{ padding: '16px 0' }}>
                        <TenderChat
                            tenderId={tender.id || tender.internal_id}
                            tenderInternalId={tender.internal_id}
                            isEnriched={hasAiEnrichment}
                            onEnrichRequest={onEnrich || (() => { })}
                            isEnriching={isEnriching || false}
                        />
                    </div>
                </PTabsItem>

                <PTabsItem label="Crawling / Sourcing">
                    <div style={{ padding: '16px 0' }}>
                        <div style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '1.5rem' }}>
                            <PHeading size="small" style={{ marginBottom: '1rem' }}>Crawling / Sourcing</PHeading>
                            <FieldGrid data={sourcingData} labelMap={sourcingLabelMap} preferredOrder={sourcingPreferred} />

                            {/* Enhanced Links Section: Documents + Additional Links */}
                            {((tender.documents && tender.documents.length > 0) || (tender.source_metadata?.additional_links && tender.source_metadata.additional_links.length > 0)) && (
                                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
                                    <PHeading size="small" style={{ marginBottom: '1rem' }}>Links to Documents</PHeading>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {/* 1. Documents */}
                                        {tender.documents && tender.documents.map((doc: any, i: number) => (
                                            <div key={`doc-${i}`} style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                                <span style={{ fontSize: '1rem', color: '#666' }}>•</span>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--tf-primary)', textDecoration: 'underline' }}>
                                                        {(() => {
                                                            const name = doc.name || 'Document';
                                                            if (name === 'Document' && doc.url) {
                                                                try {
                                                                    const urlName = doc.url.split('/').pop()?.split('?')[0];
                                                                    if (urlName && urlName.length > 3) return urlName;
                                                                } catch (e) { }
                                                            }
                                                            return name;
                                                        })()}
                                                    </a>
                                                    {(() => {
                                                        const docInfo = [doc.format?.toUpperCase(), doc.size]
                                                            .filter(Boolean)
                                                            .filter(v => v !== 'UNKNOWN' && v !== 'unknown');

                                                        return docInfo.length > 0 ? (
                                                            <PText size="x-small" color="contrast-medium" style={{ display: 'inline', marginLeft: '8px' }}>
                                                                ({docInfo.join(', ')})
                                                            </PText>
                                                        ) : null;
                                                    })()}
                                                </div>
                                            </div>
                                        ))}

                                        {/* 2. Additional Links */}
                                        {tender.source_metadata?.additional_links && tender.source_metadata.additional_links.map((link: string, i: number) => (
                                            <div key={`link-${i}`} style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                                <span style={{ fontSize: '1rem', color: '#666' }}>•</span>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--tf-primary)', textDecoration: 'underline' }}>
                                                        {link}
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* ZIP Download for Documents Only */}
                                    {tender.documents && tender.documents.length > 0 && (
                                        <div style={{ marginTop: '1.5rem' }}>
                                            <PButton variant="secondary" icon="download" loading={isZipping} onClick={handleDownloadZip}>
                                                Download Documents (ZIP)
                                            </PButton>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </PTabsItem>

                <PTabsItem label="Rating">
                    <div style={{ padding: '16px 0' }}>
                        <div style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '1.5rem' }}>
                            <PFlex justifyContent="space-between" alignItems="center" style={{ marginBottom: '1.5rem' }}>
                                <PHeading size="small">Rating</PHeading>
                                {onFeedback && (
                                    <PFlex style={{ gap: '0.5rem' }}>
                                        <PButton variant="secondary" icon="arrow-up" onClick={() => onFeedback('up')}>Feedback Up</PButton>
                                        <PButton variant="secondary" icon="arrow-down" onClick={() => onFeedback('down')}>Feedback Down</PButton>
                                    </PFlex>
                                )}
                            </PFlex>

                            {tender.feedback_given && (
                                <div style={{ marginBottom: '1rem', padding: '10px', backgroundColor: '#e8f5e9', border: '1px solid #4caf50', borderRadius: '4px' }}>
                                    <PText size="small" weight="semi-bold" color="notification-success">✅ Feedback already given for this tender.</PText>
                                </div>
                            )}

                            <FieldGrid data={ratingData} labelMap={ratingLabelMap} preferredOrder={ratingPreferred} />

                            <PText size="x-small" style={{ marginTop: '12px', fontStyle: 'italic', color: '#666' }}>
                                Keyword scores are adjusted by ±0.5 per feedback (clamped between -5.0 and +5.0).
                            </PText>
                        </div>
                    </div>
                </PTabsItem>

                <PTabsItem label="Taxonomie">
                    <div style={{ padding: '16px 0' }}>
                        <div style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '1.5rem' }}>

                            {/* Matched Office - Moved from Enriching */}
                            <PHeading size="small" style={{ marginBottom: '0.75rem' }}>Matched Office</PHeading>
                            {hasAiEnrichment && (
                                <div style={{ marginBottom: '2rem' }}>
                                    {tender.enrichment?.matched_office_id ? (
                                        <>
                                            <div style={{
                                                padding: '12px 16px',
                                                backgroundColor: '#e3f2fd',
                                                borderRadius: '4px',
                                                border: '1px solid #2196f3',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px'
                                            }}>
                                                <span style={{ fontSize: '24px' }}>📍</span>
                                                <div style={{ flex: 1 }}>
                                                    {matchedOffice ? (
                                                        <>
                                                            <PText weight="bold" style={{ fontSize: '16px' }}>{matchedOffice.name}</PText>
                                                            {(matchedOffice.city || matchedOffice.country) && (
                                                                <PText size="small" style={{ color: '#666', marginTop: '4px' }}>
                                                                    {[matchedOffice.city, matchedOffice.state, matchedOffice.country].filter(Boolean).join(', ')}
                                                                </PText>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <PText weight="semi-bold">Loading office details...</PText>
                                                    )}
                                                </div>
                                            </div>
                                            <PText size="x-small" style={{ marginTop: '8px', fontStyle: 'italic', color: '#666' }}>
                                                AI-determined nearest office for this tender's location
                                            </PText>
                                        </>
                                    ) : (
                                        <div style={{
                                            padding: '12px 16px',
                                            backgroundColor: '#f5f5f5',
                                            borderRadius: '4px',
                                            border: '1px solid #e0e0e0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}>
                                            <span style={{ fontSize: '24px', opacity: 0.5 }}>📍</span>
                                            <div>
                                                <PText weight="semi-bold" style={{ color: '#666' }}>No Office Matched</PText>
                                                <PText size="small" style={{ color: '#888', marginTop: '2px' }}>
                                                    Could not determine a suitable office match for this tender's location.
                                                </PText>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Label Matching Scores - Categorized - Moved from Rating */}
                            <PHeading size="small" style={{ marginBottom: '0.75rem' }}>Label Matching Scores</PHeading>
                            {hasAiEnrichment && (() => {
                                const matches = tender.enrichment?.label_matches || [];

                                if (matches.length === 0) {
                                    return (
                                        <div style={{ paddingTop: '1.5rem' }}>
                                            <PText size="small" style={{ fontStyle: 'italic', color: '#666' }}>
                                                No specific labels matched this tender with sufficient confidence.
                                            </PText>
                                        </div>
                                    );
                                }

                                // Helper to get label type
                                const getLabelType = (labelName: string) => {
                                    const label = allLabels.find(l => l.name === labelName);
                                    return label?.type || 'CUSTOM';
                                };

                                // Categorize matches
                                const sortedMatches = [...matches].sort((a: any, b: any) => (b.score || 0) - (a.score || 0));
                                const sectors = sortedMatches.filter(m => getLabelType(m.label_name) === 'SECTOR').slice(0, 10);
                                const services = sortedMatches.filter(m => getLabelType(m.label_name) === 'SERVICE').slice(0, 10);
                                const customLabels = sortedMatches.filter(m => getLabelType(m.label_name) === 'CUSTOM').slice(0, 10);

                                // Render function for a category
                                const renderCategory = (title: string, matches: any[]) => {
                                    if (matches.length === 0) return null;
                                    return (
                                        <div style={{ marginTop: '1.5rem' }}>
                                            <PHeading size="small" style={{ marginBottom: '0.75rem' }}>{title}</PHeading>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {matches.map((match: any, i: number) => (
                                                    <div key={i} style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        padding: '8px 12px',
                                                        backgroundColor: match.score >= 80 ? '#e8f5e9' : '#f5f5f5',
                                                        borderRadius: '4px',
                                                        border: match.score >= 80 ? '1px solid #4caf50' : '1px solid #e0e0e0'
                                                    }}>
                                                        <div style={{
                                                            minWidth: '50px',
                                                            fontWeight: 'bold',
                                                            color: match.score >= 80 ? '#2e7d32' : '#666'
                                                        }}>
                                                            {match.score}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <PText size="small" weight="semi-bold">{match.label_name}</PText>
                                                            {match.reasoning && (
                                                                <PText size="x-small" style={{ color: '#666', marginTop: '4px' }}>
                                                                    {match.reasoning}
                                                                </PText>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                };

                                return (
                                    <div>
                                        {renderCategory('Top 10 Sectors', sectors)}
                                        {renderCategory('Top 10 Services', services)}
                                        {renderCategory('Top 10 Labels', customLabels)}
                                        <PText size="x-small" style={{ marginTop: '12px', fontStyle: 'italic', color: '#666' }}>
                                            Labels with ≥80 score trigger distribution webhooks
                                        </PText>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </PTabsItem>

                <PTabsItem label="Enriching">
                    <div style={{ padding: '16px 0' }}>
                        <div style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '1.5rem' }}>
                            <PHeading size="small" style={{ marginBottom: '1rem' }}>Enriching</PHeading>

                            <FieldGrid data={enrichingData} labelMap={enrichingLabelMap} preferredOrder={enrichingPreferred} />

                            {/* Required Profiles & References */}
                            {hasAiEnrichment && tender.enrichment?.required_profiles && tender.enrichment.required_profiles.length > 0 && (
                                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e0e0e0' }}>
                                    <PHeading size="small" style={{ marginBottom: '0.75rem' }}>Required Profiles (AI)</PHeading>
                                    <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {tender.enrichment.required_profiles.map((profile: string, i: number) => (
                                            <li key={`${profile}-${i}`}>
                                                <PText size="small">{profile}</PText>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {hasAiEnrichment && tender.enrichment?.required_references && tender.enrichment.required_references.length > 0 && (
                                <div style={{ marginTop: '1.5rem' }}>
                                    <PHeading size="small" style={{ marginBottom: '0.75rem' }}>Required References (AI)</PHeading>
                                    <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {tender.enrichment.required_references.map((ref: string, i: number) => (
                                            <li key={`${ref}-${i}`}>
                                                <PText size="small">{ref}</PText>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </PTabsItem>

                <PTabsItem label="Bid Strategy one-pager">
                    <div style={{ padding: '16px 0' }}>
                        <div style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '1.5rem' }}>
                            <PHeading size="small" style={{ marginBottom: '1rem' }}>Bid Strategy One-Pager</PHeading>
                            {hasAiEnrichment && tender.enrichment?.ai_bid_onepager ? (
                                <AiBidOnePager
                                    markdown={tender.enrichment.ai_bid_onepager}
                                    tenderUrl={tender.url}
                                    pdfFileName={`ai-bid-onepager-${tender.internal_id || tender.id || 'tender'}.pdf`}
                                    onDownloadZip={tender.documents && tender.documents.length > 0 ? handleDownloadZip : undefined}
                                    isZipping={isZipping}
                                />
                            ) : (
                                <PText size="small" color="contrast-medium">No one-pager available for this tender yet.</PText>
                            )}
                        </div>
                    </div>
                </PTabsItem>

                <PTabsItem label="Distributing">
                    <div style={{ padding: '16px 0' }}>
                        <div style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '1.5rem' }}>
                            <PHeading size="small" style={{ marginBottom: '1rem' }}>Data Distribution</PHeading>
                            <PText style={{ marginBottom: '1.5rem' }}>
                                Distribute this tender manually to active Teams channels.
                            </PText>

                            {loadingChannels ? (
                                <PText>Loading channels...</PText>
                            ) : activeChannels.length === 0 ? (
                                <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                                    <PText>No active distribution channels definition found.</PText>
                                    <PText size="small" color="contrast-medium">Configure webhooks in Settings &gt; Distribution.</PText>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {activeChannels.map((channel) => (
                                        <div key={channel.id} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '1rem',
                                            border: '1px solid #eee',
                                            borderRadius: '4px',
                                            backgroundColor: '#fafafa'
                                        }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <PText weight="semi-bold">{channel.name}</PText>
                                                    <PTag color="background-base">{channel.type}</PTag>
                                                </div>
                                                {channel.description && <PText size="small" color="contrast-medium">{channel.description}</PText>}
                                            </div>

                                            <PButton
                                                variant="secondary"
                                                icon="chat"
                                                loading={sendingChannelId === channel.id}
                                                disabled={sendingChannelId !== null}
                                                onClick={() => handleSendToChannel(channel)}
                                            >
                                                Send to MS Teams
                                            </PButton>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Distribution Log Section */}
                            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e0e0e0' }}>
                                <PHeading size="small" style={{ marginBottom: '1rem' }}>Distribution Log</PHeading>
                                {tender.distribution_logs && tender.distribution_logs.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {tender.distribution_logs.map((log: any, i: number) => (
                                            <div key={i} style={{
                                                padding: '12px',
                                                backgroundColor: '#f9f9f9',
                                                border: '1px solid #eee',
                                                borderRadius: '4px', // Fixed border radius
                                                borderLeft: log.status === 'SENT' ? '4px solid #4caf50' : '4px solid #d32f2f'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div>
                                                        <PText weight="semi-bold">{log.webhook_name}</PText>
                                                        <PText size="small" color="contrast-medium">
                                                            {new Date(log.sent_at).toLocaleString('de-DE')}
                                                        </PText>
                                                    </div>
                                                    <PTag color={log.status === 'SENT' ? 'notification-success' : 'notification-error'}>
                                                        {log.status === 'SENT' ? 'Success' : 'Failed'}
                                                    </PTag>
                                                </div>
                                                {log.error_message && (
                                                    <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
                                                        <PText size="x-small" color="notification-error" style={{ whiteSpace: 'pre-wrap' }}>
                                                            {log.error_message}
                                                        </PText>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <PText size="small" color="contrast-medium" style={{ fontStyle: 'italic' }}>
                                        No distribution history available for this tender.
                                    </PText>
                                )}
                            </div>
                        </div>
                    </div>
                </PTabsItem>
            </PTabs>
        </PFlex >
    );
};
