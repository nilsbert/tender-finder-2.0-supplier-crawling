import { type FC, useState, useEffect } from 'react';
import {PHeading,
    PSelectWrapper,
    PButton,
    PText,
    PTag,
    PFlex} from '@porsche-design-system/components-react';
import { bidDecisionApi } from './api';
import type { BidDecisionType, ReasonCode, BidDecisionFull } from './types';
import { DECISION_LABELS, REASON_CODE_LABELS } from './types';

interface BidDecisionPanelProps {
    tenderId: string;
}

/**
 * Panel component for recording bid/no-bid decisions for a tender.
 * Displays in the Tender Detail Drawer.
 */
export const BidDecisionPanel: FC<BidDecisionPanelProps> = ({ tenderId }) => {
    const [decision, setDecision] = useState<BidDecisionType | ''>('');
    const [reasonCodes, setReasonCodes] = useState<ReasonCode[]>([]);
    const [notes, setNotes] = useState('');
    const [decidedBy, setDecidedBy] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [existingDecision, setExistingDecision] = useState<BidDecisionFull | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    // Load existing decision
    useEffect(() => {
        const loadDecision = async () => {
            setIsLoading(true);
            try {
                const existingDec = await bidDecisionApi.getDecisionByTender(tenderId);
                if (existingDec) {
                    setExistingDecision(existingDec);
                    setDecision(existingDec.decision);
                    setReasonCodes(existingDec.reason_codes);
                    setNotes(existingDec.notes || '');
                    setDecidedBy(existingDec.decided_by || '');
                }
            } catch (error: any) {
                // Ignore 404 (not found) as it means no decision yet
                if (error.response && error.response.status === 404) {
                    return;
                }
                console.error('Failed to load decision:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDecision();
    }, [tenderId]);

    const handleSave = async () => {
        if (!decision) {
            showToastMessage('Please select a decision', 'error');
            return;
        }

        setIsSaving(true);
        try {
            const decisionData = {
                tender_id: tenderId,
                decision,
                reason_codes: reasonCodes,
                notes: notes || undefined,
                decided_by: decidedBy || undefined,
            };

            if (existingDecision) {
                await bidDecisionApi.updateDecision(existingDecision.id, decisionData);
                showToastMessage('Decision updated successfully', 'success');
            } else {
                const created = await bidDecisionApi.createDecision(decisionData);
                setExistingDecision(created);
                showToastMessage('Decision saved successfully', 'success');
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to save decision';
            showToastMessage(message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const showToastMessage = (message: string, type: 'success' | 'error') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleReasonCodeToggle = (code: ReasonCode) => {
        if (reasonCodes.includes(code)) {
            setReasonCodes(reasonCodes.filter(c => c !== code));
        } else {
            setReasonCodes([...reasonCodes, code]);
        }
    };

    if (isLoading) {
        return (
            <div style={{ padding: '16px' }}>
                <PHeading size="small">Bid Decision</PHeading>
                <PText>Loading...</PText>
            </div>
        );
    }

    return (
        <div style={{ padding: '16px 0' }}>
            <PHeading size="small" style={{ marginBottom: '16px' }}>
                Bid Decision
            </PHeading>

            {!existingDecision && (
                <PText size="small" style={{ marginBottom: '12px', color: '#666' }}>
                    No decision recorded yet. Record your bid/no-bid decision below.
                </PText>
            )}

            {/* Decision Type */}
            <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                    Decision <span style={{ color: 'var(--tf-accent)' }}>*</span>
                </label>
                <PSelectWrapper label="Decision">
                    <select
                        name="decision"
                        value={decision}
                        onChange={(e) => setDecision(e.target.value as BidDecisionType)}
                    >
                        <option value="">Select decision...</option>
                        <option value="bid">{DECISION_LABELS.bid}</option>
                        <option value="no_bid">{DECISION_LABELS.no_bid}</option>
                        <option value="defer">{DECISION_LABELS.defer}</option>
                        <option value="needs_info">{DECISION_LABELS.needs_info}</option>
                    </select>
                </PSelectWrapper>
            </div>

            {/* Reason Codes */}
            <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                    Reason Codes
                </label>
                <PFlex style={{ gap: '8px', flexWrap: 'wrap' }}>
                    {(Object.keys(REASON_CODE_LABELS) as ReasonCode[]).map(code => (
                        <PTag
                            key={code}
                            color={reasonCodes.includes(code) ? 'notification-info-soft' : 'background-base'}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleReasonCodeToggle(code)}
                        >
                            {REASON_CODE_LABELS[code]}
                        </PTag>
                    ))}
                </PFlex>
                <PText size="x-small" style={{ marginTop: '4px', color: '#666' }}>
                    Click to select/deselect reason codes
                </PText>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                    Notes
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional context or notes..."
                    rows={3}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                    }}
                />
            </div>

            {/* Decided By */}
            <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                    Decided By
                </label>
                <input
                    type="text"
                    value={decidedBy}
                    onChange={(e) => setDecidedBy(e.target.value)}
                    placeholder="Your name (optional)"
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '14px',
                    }}
                />
            </div>

            {/* Save Button */}
            <PButton
                variant="primary"
                onClick={handleSave}
                disabled={isSaving || !decision}
                loading={isSaving}
            >
                {existingDecision ? 'Update Decision' : 'Save Decision'}
            </PButton>

            {/* Existing Decision Info */}
            {existingDecision && (
                <PText size="x-small" style={{ marginTop: '12px', color: '#666' }}>
                    Last updated: {new Date(existingDecision.decided_at).toLocaleString('de-DE')}
                </PText>
            )}

            {/* Toast shown below - managed by state */}
            <div
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 9999,
                    display: showToast ? 'block' : 'none',
                }}
            >
                <div
                    style={{
                        padding: '12px 24px',
                        borderRadius: '4px',
                        backgroundColor: toastType === 'success' ? '#1b7e28' : 'var(--tf-danger)',
                        color: 'white',
                        fontWeight: 600,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}
                >
                    {toastMessage}
                </div>
            </div>
        </div>
    );
};
