import {PModal, PButton, PHeading, PText, PFlex, PTag, PIcon} from '@porsche-design-system/components-react'
import type { Keyword, KeywordCreate } from './api'

export interface KeywordImportSummary {
    created: KeywordCreate[];
    updated: KeywordCreate[];
    deleted: Keyword[];
    total_count: number;
    errors: string[];
}

interface ImportDiffModalProps {
    isOpen: boolean;
    onClose: () => void;
    summary: KeywordImportSummary | null;
    onConfirm: (deleteMissing: boolean) => void;
    isExecuting: boolean;
}

export const ImportDiffModal: React.FC<ImportDiffModalProps> = ({
    isOpen,
    onClose,
    summary,
    onConfirm,
    isExecuting
}) => {
    if (!summary) return null;

    const hasCreates = summary.created.length > 0;
    const hasUpdates = summary.updated.length > 0;
    const hasDeletes = summary.deleted.length > 0;

    return (
        <PModal
            open={isOpen}
            onDismiss={onClose}
            heading="Import Preview"
            style={{ width: '800px', maxWidth: '90vw' }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <PText>
                    Review the changes that will be applied to your keywords database.
                </PText>

                <PFlex style={{ gap: '16px', flexWrap: 'wrap' }}>
                    <PTag color={hasCreates ? "success" : "background-surface"}>Creating: {summary.created.length}</PTag>
                    <PTag color={hasUpdates ? "warning" : "background-surface"}>Updating: {summary.updated.length}</PTag>
                    <PTag color={hasDeletes ? "error" : "background-surface"}>Missing in file: {summary.deleted.length}</PTag>
                </PFlex>

                <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '16px' }}>

                    {/* Creates */}
                    {hasCreates && (
                        <div style={{ marginBottom: '24px' }}>
                            <PHeading size="small" style={{ marginBottom: '8px' }} color="success">New Keywords ({summary.created.length})</PHeading>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {summary.created.map((k, i) => (
                                    <li key={i} style={{ padding: '4px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
                                        <PText weight="semi-bold">{k.term}</PText>
                                        <PText size="small" color="contrast-medium">{k.type} - {k.weight}</PText>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Updates */}
                    {hasUpdates && (
                        <div style={{ marginBottom: '24px' }}>
                            <PHeading size="small" style={{ marginBottom: '8px' }} color="warning">Updated Keywords ({summary.updated.length})</PHeading>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {summary.updated.map((k, i) => (
                                    <li key={i} style={{ padding: '4px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
                                        <PText weight="semi-bold">{k.term}</PText>
                                        <PText size="small" color="contrast-medium">New Weight: {k.weight}</PText>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Deletes */}
                    {hasDeletes && (
                        <div>
                            <PHeading size="small" style={{ marginBottom: '8px' }} color="error">Missing in Upload ({summary.deleted.length})</PHeading>
                            <PText size="small" style={{ marginBottom: '8px' }}>These keywords exist in the DB but are not in your file.</PText>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {summary.deleted.map((k, i) => (
                                    <li key={i} style={{ padding: '4px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
                                        <PText weight="semi-bold">{k.term}</PText>
                                        <PText size="small" color="contrast-medium">{k.type}</PText>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {!hasCreates && !hasUpdates && !hasDeletes && (
                        <div style={{ textAlign: 'center', padding: '32px' }}>
                            <PText color="success">No changes detected. Your keywords are in sync.</PText>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '16px', borderTop: '1px solid #e0e0e0', paddingTop: '16px' }}>
                    {hasDeletes ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ backgroundColor: '#FFF5F5', padding: '16px', borderRadius: '4px', border: '1px solid #FFD6D6' }}>
                                <PFlex alignItems="center" style={{ gap: '12px' }}>
                                    <PIcon name="warning" color="notification-error" />
                                    <PText color="notification-error" weight="semi-bold">Warning: {summary.deleted.length} keywords are missing from your file.</PText>
                                </PFlex>
                                <PText size="small" style={{ marginTop: '8px', marginLeft: '36px' }}>
                                    If you choose "Sync & Delete", these keywords will be permanently removed from the database.
                                </PText>
                            </div>

                            <PFlex justifyContent="flex-end" style={{ gap: '12px' }}>
                                <PButton variant="tertiary" onClick={onClose} disabled={isExecuting}>Cancel</PButton>
                                <PButton variant="secondary" onClick={() => onConfirm(false)} loading={isExecuting}>
                                    Merge (Keep Missing)
                                </PButton>
                                <PButton variant="primary" color="notification-error" onClick={() => onConfirm(true)} loading={isExecuting}>
                                    Sync (Delete Missing)
                                </PButton>
                            </PFlex>
                        </div>
                    ) : (
                        <PFlex justifyContent="flex-end" style={{ gap: '12px' }}>
                            <PButton variant="tertiary" onClick={onClose} disabled={isExecuting}>Cancel</PButton>
                            <PButton variant="primary" onClick={() => onConfirm(false)} loading={isExecuting} disabled={!hasCreates && !hasUpdates}>
                                Confirm Import
                            </PButton>
                        </PFlex>
                    )}
                </div>

            </div>
        </PModal>
    )
}
