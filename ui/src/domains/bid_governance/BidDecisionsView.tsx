import { type FC, useState, useEffect } from 'react';
import {PHeading,
    PButton,
    PTag,
    PText,
    
    PSelectWrapper,
    PFlex,
    PLink} from '@porsche-design-system/components-react';
import { bidDecisionApi } from './api';
import { api as crawlerApi } from '../sourcing/api';
import type { BidDecisionFull, BidDecisionType } from './types';
import { DECISION_LABELS } from './types';
import TenderDetailModal from '../rating/TenderDetailModal';
import { AiBidOnePager } from '../../components/AiBidOnePager';
import { useTranslation } from 'react-i18next';

export const BidDecisionsView: FC = () => {
    const { t } = useTranslation();
    const [viewMode, setViewMode] = useState<'list' | 'one-pagers'>('list');
    const [isLoading, setIsLoading] = useState(false);
    const [decisions, setDecisions] = useState<BidDecisionFull[]>([]);
    const [tendersMap, setTendersMap] = useState<Record<string, any>>({});
    const [decisionFilter, setDecisionFilter] = useState<BidDecisionType | ''>('');
    const [dateFilter, setDateFilter] = useState<string>('all');
    const [page, setPage] = useState(0);
    const [selectedTender, setSelectedTender] = useState<any>(null); // Weak type for now as we enrich from crawlerApi
    const [isModalOpen, setIsModalOpen] = useState(false);

    const LIMIT = 20;

    const fetchDecisions = async () => {
        setIsLoading(true);
        try {
            const sinceDate = getSinceDate(dateFilter);
            const data = await bidDecisionApi.listDecisions({
                decision: decisionFilter || undefined,
                since: sinceDate ? sinceDate.toISOString() : undefined,
                limit: LIMIT,
                offset: page * LIMIT
            });
            setDecisions(data);

            // Enrich with tender data
            // Gather unique tender IDs we don't have yet
            const missingTenderIds = [...new Set(data.map(d => d.tender_id).filter(id => !tendersMap[id]))];

            if (missingTenderIds.length > 0) {
                // Fetch them in parallel (batched would be better but simple loops for now)
                const newTenders: Record<string, any> = {};
                await Promise.all(missingTenderIds.map(async (id) => {
                    try {
                        const t = await crawlerApi.getTender(id);
                        newTenders[id] = t;
                    } catch {
                        newTenders[id] = { headline: 'Unknown Tender', id };
                    }
                }));
                setTendersMap(prev => ({ ...prev, ...newTenders }));
            }
        } catch (error) {
            console.error('Failed to fetch decisions', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getSinceDate = (filter: string): Date | undefined => {
        const now = new Date();
        if (filter === 'today') {
            return new Date(now.setHours(0, 0, 0, 0));
        }
        if (filter === 'week') {
            const d = new Date(now);
            d.setDate(d.getDate() - 7);
            return d;
        }
        if (filter === 'month') {
            const d = new Date(now);
            d.setMonth(d.getMonth() - 1);
            return d;
        }
        return undefined;
    };

    useEffect(() => {
        fetchDecisions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [decisionFilter, dateFilter, page]); // Re-fetch when filters change

    const handleTenderClick = (tenderId: string) => {
        const tender = tendersMap[tenderId];
        if (tender) {
            setSelectedTender(tender);
            setIsModalOpen(true);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedTender(null);
        // Refresh list to update any changes made in modal
        fetchDecisions();
    };

    return (
        <div className="p-content-wrapper">
            <div style={{ padding: '32px 24px' }}>
                <PFlex justifyContent="space-between" alignItems="center" style={{ marginBottom: '24px' }}>
                    <PHeading size="large">Bid Governance</PHeading>
                    <PFlex gap="16px">
                        <PButton
                            variant={viewMode === 'list' ? 'primary' : 'secondary'}
                            icon="list"
                            onClick={() => setViewMode('list')}
                        >
                            List View
                        </PButton>
                        <PButton
                            variant={viewMode === 'one-pagers' ? 'primary' : 'secondary'}
                            icon="document"
                            onClick={() => setViewMode('one-pagers')}
                        >
                            One Pagers
                        </PButton>
                        <PButton
                            variant="secondary"
                            icon="refresh"
                            onClick={fetchDecisions}
                            loading={isLoading}
                        >
                            Refresh
                        </PButton>
                    </PFlex>
                </PFlex>

                {/* Filters */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '24px',
                    borderRadius: '8px',
                    marginBottom: '24px',
                    display: 'flex',
                    gap: '24px',
                    flexWrap: 'wrap',
                    alignItems: 'flex-end',
                    border: '1px solid #e0e0e0'
                }}>
                    <div style={{ minWidth: '200px' }}>
                        <PSelectWrapper label="Decision">
                            <select
                                value={decisionFilter}
                                onChange={(e) => setDecisionFilter(e.target.value as BidDecisionType | '')}
                            >
                                <option value="">All Decisions</option>
                                <option value="bid">{DECISION_LABELS.bid}</option>
                                <option value="no_bid">{DECISION_LABELS.no_bid}</option>
                                <option value="defer">{DECISION_LABELS.defer}</option>
                                <option value="needs_info">{DECISION_LABELS.needs_info}</option>
                            </select>
                        </PSelectWrapper>
                    </div>

                    <div style={{ minWidth: '200px' }}>
                        <PSelectWrapper label="Timeframe">
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value as any)}
                            >
                                <option value="all">All Time</option>
                                <option value="month">Last 30 Days</option>
                                <option value="week">Last 7 Days</option>
                                <option value="today">Today</option>
                            </select>
                        </PSelectWrapper>
                    </div>

                    <div style={{ flex: 1 }}></div>

                    {/* Stats Summary (Simple) */}
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <PText size="large" weight="semi-bold">{decisions.filter(d => d.decision === 'bid').length}</PText>
                            <PText size="x-small" color="contrast-low">Bids</PText>
                        </div>
                        <div style={{ width: '1px', backgroundColor: '#e0e0e0' }}></div>
                        <div style={{ textAlign: 'center' }}>
                            <PText size="large" weight="semi-bold">{decisions.filter(d => d.decision === 'no_bid').length}</PText>
                            <PText size="x-small" color="contrast-low">No-Bids</PText>
                        </div>
                    </div>
                </div>

                {/* View Content */}
                {viewMode === 'list' ? (
                    /* Data Table */
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid #e0e0e0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f0f0f0', backgroundColor: '#f9f9f9', textAlign: 'left' }}>
                                    <th style={{ padding: '16px 24px' }}><PText weight="semi-bold">Tender</PText></th>
                                    <th style={{ padding: '16px 24px', width: '140px' }}><PText weight="semi-bold">Decision</PText></th>
                                    <th style={{ padding: '16px 24px' }}><PText weight="semi-bold">Reasons</PText></th>
                                    <th style={{ padding: '16px 24px', width: '180px' }}><PText weight="semi-bold">Decided At</PText></th>
                                    <th style={{ padding: '16px 24px', width: '140px' }}><PText weight="semi-bold">By</PText></th>
                                    <th style={{ padding: '16px 24px', width: '80px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {decisions.map((decision) => {
                                    const tender = tendersMap[decision.tender_id];
                                    return (
                                        <tr key={decision.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                            <td style={{ padding: '16px 24px' }}>
                                                {tender ? (
                                                    <div>
                                                        <PFlex alignItems="center" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
                                                            <PLink href="#" onClick={(e) => { e.preventDefault(); handleTenderClick(decision.tender_id); }}>
                                                                {tender.headline?.substring(0, 80)}{tender.headline?.length > 80 ? '...' : ''}
                                                            </PLink>
                                                            {tender.ai_enriched_at && (
                                                                <PTag icon="sparkles" color="notification-info-soft">AI</PTag>
                                                            )}
                                                        </PFlex>
                                                        <PText size="x-small" color="contrast-low" style={{ marginTop: '4px' }}>
                                                            {tender.caller} • {tender.name_website}
                                                        </PText>
                                                    </div>
                                                ) : (
                                                    <PText color="contrast-low">Loading tender info...</PText>
                                                )}
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <PTag color={
                                                    decision.decision === 'bid' ? 'notification-success' :
                                                        decision.decision === 'no_bid' ? 'notification-error' :
                                                            'notification-warning'
                                                }>
                                                    {DECISION_LABELS[decision.decision as BidDecisionType]}
                                                </PTag>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <PFlex style={{ gap: '4px', flexWrap: 'wrap' }}>
                                                    {decision.reason_codes.map(code => (
                                                        <span key={code} style={{
                                                            backgroundColor: '#f2f2f2',
                                                            padding: '2px 8px',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            color: '#333'
                                                        }}>
                                                            {code.replace(/_/g, ' ')}
                                                        </span>
                                                    ))}
                                                    {decision.notes && (
                                                        <span title={decision.notes} style={{ cursor: 'help' }}>📝</span>
                                                    )}
                                                </PFlex>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <PText size="small">
                                                    {new Date(decision.decided_at).toLocaleDateString()}
                                                    <span style={{ color: '#999', marginLeft: '4px' }}>
                                                        {new Date(decision.decided_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </PText>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <PText size="small">{decision.decided_by || '-'}</PText>
                                            </td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                <PButton
                                                    variant="tertiary"
                                                    icon="edit"
                                                    hideLabel
                                                    onClick={() => handleTenderClick(decision.tender_id)}
                                                >Edit</PButton>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {decisions.length === 0 && !isLoading && (
                                    <tr>
                                        <td colSpan={6} style={{ padding: '48px', textAlign: 'center' }}>
                                            <PText color="contrast-low">No decisions found matching your filters.</PText>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {/* Pagination Controls */}
                        <div style={{
                            padding: '16px 24px',
                            borderTop: '1px solid #f0f0f0',
                            backgroundColor: '#f9f9f9',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            gap: '16px'
                        }}>
                            <PButton
                                variant="secondary"
                                icon="arrow-left"
                                disabled={page === 0 || isLoading}
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                            >
                                {t('common.previous')}
                            </PButton>
                            <PText>{t('common.page')} {page + 1}</PText>
                            <PButton
                                variant="secondary"
                                icon="arrow-right"
                                disabled={decisions.length < LIMIT || isLoading} // Assuming LIMIT checking against < limit implies end
                                onClick={() => setPage(p => p + 1)}
                            >
                                {t('common.next')}
                            </PButton>
                        </div>
                    </div>
                ) : (
                    /* One Pagers View */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                        {/* 
                        {decisions.map((decision) => {
                             // ... temporarily commented out ...
                             return <div key={decision.id}>Placeholder</div>
                        })}
                        */}
                        <PText>One Pagers View Placeholder</PText>
                    </div>
                )}
            </div>

            {/* Reuse the TenderDetailModal which should now include the BidDecisionPanel */}
            {
                selectedTender && (
                    <TenderDetailModal
                        open={isModalOpen}
                        onClose={handleModalClose}
                        tender={selectedTender}
                    />
                )
            }
        </div>
    );
};
