import React from 'react';
import {PModal,
    PHeading,
    PText,
    PTag} from '@porsche-design-system/components-react';
import { BidDecisionPanel } from '../bid_governance/BidDecisionPanel';
import { TenderOwnershipPanel } from '../bid_governance/TenderOwnershipPanel';
import '../sourcing/components/TenderDetailContentMarkdown.css';
import { AiBidOnePager } from '../../components/AiBidOnePager';

interface TenderDetailModalProps {
    open: boolean;
    onClose: () => void;
    tender: any; // Using any for simplicity as Tender type is complex
}

const TenderDetailModal: React.FC<TenderDetailModalProps> = ({ open, onClose, tender }) => {
    if (!tender) return null;

    const isEnriched = !!(tender.ai_enriched_at ?? tender.enriched_at);
    const isLocked = tender.enrichment_locked;

    const aiSummary =
        tender?.enrichment?.ai_summary ??
        tender?.enriched_summary_md ??
        '';

    const aiBidOnePager =
        tender?.enrichment?.ai_bid_onepager ??
        tender?.ai_bid_onepager ??
        '';

        <PModal open={open} onClose={onClose} aria={{ 'aria-label': 'Tender Details' }}>
            <PHeading size="large" slot="header">Tender Details</PHeading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Header Info */}
                <div>
                    <PHeading size="medium">{tender.headline}</PHeading>
                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <PTag color="background-base">{tender.name_website}</PTag>
                        <PTag color="background-base">{tender.caller}</PTag>
                        {tender.rating_total >= 50 ? (
                            <PTag color="notification-success">Scoring: {tender.rating_total}%</PTag>
                        ) : (
                            <PTag color="notification-warning">Scoring: {tender.rating_total}%</PTag>
                        )}
                        {isEnriched && <PTag color="notification-info-soft">AI Enriched</PTag>}
                        {isLocked && <PTag icon="lock">Locked</PTag>}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>

                    {/* Main Content */}
                    <div>
                        {/* Summary Section */}
                        {aiSummary ? (
                            <div className="markdown-body" style={{
                                backgroundColor: '#f9f9f9',
                                padding: '16px',
                                borderRadius: '4px',
                                borderLeft: '4px solid var(--tf-accent)'
                            }}>
                                <PHeading size="small">AI Summary</PHeading>
                                <div style={{ marginTop: '16px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                    {aiSummary}
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                backgroundColor: '#f9f9f9',
                                padding: '16px',
                                borderRadius: '4px',
                                color: '#666'
                            }}>
                                <PText>No AI summary available.</PText>
                            </div>
                        )}

                        {/* Description */}
                        <div style={{ marginTop: '24px' }}>
                            <PHeading size="small">Description</PHeading>
                            <PText style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>
                                {tender.description}
                            </PText>
                        </div>

                        {/* AI Bid Strategy (One-Pager) */}
                        {markdownOnePager && (
                            <div style={{ marginTop: '24px' }}>
                                <PHeading size="small" style={{ marginBottom: '12px' }}>AI Bid Strategy (One-Pager)</PHeading>
                                <AiBidOnePager
                                    markdown={markdownOnePager}
                                    tenderUrl={tender.url}
                                    pdfFileName={`ai-bid-onepager-${tender.id || tender.internal_id || 'tender'}.pdf`}
                                />
                            </div>
                        )}
                    </div>

                    {/* Sidebar Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        <div style={{ padding: '0 16px', border: '1px solid #eee', borderRadius: '4px', backgroundColor: '#fff' }}>
                            <TenderOwnershipPanel tenderId={tender.id} />
                        </div>

                        {/* Bid Decision Panel */}
                        <div style={{ padding: '0 16px', border: '1px solid var(--tf-accent)', borderRadius: '4px', backgroundColor: 'var(--tf-accent-bg)' }}>
                            <BidDecisionPanel tenderId={tender.id} />
                        </div>

                        <div style={{ padding: '16px', border: '1px solid #eee', borderRadius: '4px' }}>
                            <PHeading size="small">Key Details</PHeading>
                            <ul style={{ listStyle: 'none', padding: 0, marginTop: '8px', fontSize: '14px' }}>
                                <li style={{ marginBottom: '8px' }}>
                                    <strong>Due:</strong> {tender.due ? new Date(tender.due).toLocaleDateString() : 'N/A'}
                                </li>
                                <li style={{ marginBottom: '8px' }}>
                                    <strong>Published:</strong> {tender.published ? new Date(tender.published).toLocaleDateString() : 'N/A'}
                                </li>
                                <li style={{ marginBottom: '8px' }}>
                                    <strong>Location:</strong> {tender.matched_location || tender.location || 'Unknown'}
                                </li>
                                <li style={{ marginBottom: '8px' }}>
                                    <strong>Est. Volume:</strong> {tender.est_volume || 'N/A'}
                                </li>
                            </ul>
                        </div>

                        {/* Category Scores */}
                        {tender.rating_by_category && Object.keys(tender.rating_by_category).length > 0 && (
                            <div style={{ padding: '16px', border: '1px solid #eee', borderRadius: '4px' }}>
                                <PHeading size="small">Category Scores</PHeading>
                                <ul style={{ listStyle: 'none', padding: 0, marginTop: '8px', fontSize: '14px' }}>
                                    {Object.entries(tender.rating_by_category).map(([cat, score]) => (
                                        <li key={cat} style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>{cat}</span>
                                            <strong>{score as number}</strong>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Audit Info */}
                        {tender.enrichment_audit && (
                            <div style={{ padding: '16px', border: '1px solid #eee', borderRadius: '4px', backgroundColor: '#fafafa' }}>
                                <PHeading size="small">Enrichment Audit</PHeading>
                                <ul style={{ listStyle: 'none', padding: 0, marginTop: '8px', fontSize: '12px', color: '#666' }}>
                                    <li><strong>Provider:</strong> {tender.enrichment_audit.provider}</li>
                                    <li><strong>Model:</strong> {tender.enrichment_audit.model}</li>
                                    <li><strong>Time:</strong> {new Date(tender.enrichment_audit.completed_at).toLocaleString()}</li>
                                </ul>
                            </div>
                        )}

                        <div style={{ marginTop: 'auto' }}>
                            {tender.url && (
                                <a href={tender.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                    <button style={{
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: 'var(--tf-accent)',
                                        color: 'white',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}>
                                        View Source
                                    </button>
                                </a>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </PModal>
    );
};

export default TenderDetailModal;
