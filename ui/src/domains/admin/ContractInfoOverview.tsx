import { useState, useEffect } from 'react';
import {PHeading, PText, PTable, PTableHead, PTableHeadRow, PTableHeadCell, PTableBody, PTableRow, PTableCell, PButton, PSpinner, PInlineNotification} from '@porsche-design-system/components-react';
import { adminApi } from './api';

export const ContractInfoOverview = () => {
    const [tenders, setTenders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const LIMIT = 50;

    const fetchTenders = async (reset = false) => {
        try {
            setLoading(true);
            const currentOffset = reset ? 0 : offset;
            const data = await adminApi.getContractInfoTenders(LIMIT, currentOffset);
            
            if (reset) {
                setTenders(data);
            } else {
                setTenders(prev => [...prev, ...data]);
            }
            
            setOffset(currentOffset + LIMIT);
            setHasMore(data.length === LIMIT);
            setError('');
        } catch (err: any) {
            setError('Failed to fetch contract information tenders.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTenders(true);
    }, []);

    const handleReclassify = async (tenderId: string) => {
        try {
            await adminApi.reclassifyTender(tenderId, 'open');
            // Remove from list
            setTenders(prev => prev.filter(t => t.id !== tenderId));
            setError('');
        } catch (err) {
            setError('Failed to reclassify tender.');
        }
    };

    return (
        <div className="p-content-wrapper">
            <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', marginTop: '24px' }}>
                <PHeading size="medium" style={{ marginBottom: '16px' }}>Contract Information (Closed Tenders)</PHeading>
                <PText style={{ marginBottom: '24px' }}>
                    Tenders that have been automatically classified as mere contract information or awards.
                    They are hidden from the main sourcing view by default.
                </PText>

                {error && <PInlineNotification state="error" style={{ marginBottom: '16px' }} onDismiss={() => setError('')}>{error}</PInlineNotification>}

                {loading && tenders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px' }}><PSpinner size="large" /></div>
                ) : (
                    <>
                        {tenders.length === 0 ? (
                            <PText color="contrast-medium">No contract information tenders found.</PText>
                        ) : (
                            <PTable>
                                <span slot="caption">List of closed tenders and contract awards</span>
                                <PTableHead>
                                    <PTableHeadRow>
                                        <PTableHeadCell>Published</PTableHeadCell>
                                        <PTableHeadCell>Headline</PTableHeadCell>
                                        <PTableHeadCell>Awarded Contractor</PTableHeadCell>
                                        <PTableHeadCell>Value</PTableHeadCell>
                                        <PTableHeadCell>Actions</PTableHeadCell>
                                    </PTableHeadRow>
                                </PTableHead>
                                <PTableBody>
                                    {tenders.map((tender) => (
                                        <PTableRow key={tender.id}>
                                            <PTableCell>
                                                {tender.published_at ? new Date(tender.published_at).toLocaleDateString() : '-'}
                                            </PTableCell>
                                            <PTableCell>
                                                <div style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    <a href={`/tenders/${tender.id}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'var(--p-action-primary)' }}>
                                                        {tender.headline || tender.title || '-'}
                                                    </a>
                                                </div>
                                            </PTableCell>
                                            <PTableCell>{tender.awarded_contractor || '-'}</PTableCell>
                                            <PTableCell>{tender.contract_value || '-'}</PTableCell>
                                            <PTableCell>
                                                <PButton variant="secondary" onClick={() => handleReclassify(tender.id)}>
                                                    Reclassify as Open
                                                </PButton>
                                            </PTableCell>
                                        </PTableRow>
                                    ))}
                                </PTableBody>
                            </PTable>
                        )}

                        {hasMore && (
                            <div style={{ textAlign: 'center', marginTop: '24px' }}>
                                <PButton variant="ghost" icon="arrow-down" onClick={() => fetchTenders(false)}>
                                    Load More
                                </PButton>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ContractInfoOverview;
