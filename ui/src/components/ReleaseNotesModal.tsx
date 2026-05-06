import type { FC } from 'react';
import {PModal,
    PHeading,
    PText,
    PDivider,
    PSpinner,
    PIcon} from '@porsche-design-system/components-react';
import type { ReleaseNote } from '../hooks/useReleaseNotes';

interface ReleaseNotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    notes: ReleaseNote[];
    loading: boolean;
    error?: string | null;
}

export const ReleaseNotesModal: FC<ReleaseNotesModalProps> = ({
    isOpen,
    onClose,
    notes,
    loading,
    error
}) => {
    return (
        <PModal
            open={isOpen}
            onDismiss={onClose}
            aria={{ 'aria-label': 'Release Notes Modal' }}
        >
            <PHeading size="large" slot="header">System Updates</PHeading>
            <div style={{ padding: '8px 0', minHeight: '200px', maxHeight: '60vh', overflowY: 'auto' }}>
                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <PSpinner size="medium" aria={{ 'aria-label': 'loading' }} />
                    </div>
                )}

                {error && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', textAlign: 'center' }}>
                        <PIcon name="exclamation" color="notification-error" size="large" />
                        <PText color="notification-error" style={{ marginTop: '1rem' }}>{error}</PText>
                    </div>
                )}

                {!loading && !error && notes.length === 0 && (
                    <PText color="contrast-medium" style={{ textAlign: 'center', padding: '2rem' }}>
                        No release notes found.
                    </PText>
                )}

                {!loading && !error && notes.map((note, idx) => (
                    <div key={note.version} style={{ marginBottom: idx === notes.length - 1 ? 0 : '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                            <PHeading size="small">Version {note.version}: {note.title}</PHeading>
                            <PText size="x-small" color="contrast-medium">{note.date}</PText>
                        </div>
                        <ul style={{ paddingLeft: '1.25rem', margin: '8px 0' }}>
                            {note.changes.map((change, cIdx) => (
                                <li key={cIdx} style={{ marginBottom: '4px' }}>
                                    <PText size="small">{change}</PText>
                                </li>
                            ))}
                        </ul>
                        {idx !== notes.length - 1 && <PDivider style={{ marginTop: '16px' }} />}
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="close"
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#000',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Close
                </button>
            </div>
        </PModal>
    );
};
