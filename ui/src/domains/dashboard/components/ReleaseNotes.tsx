import type { FC } from 'react';
import {PHeading, PText, PDivider} from '@porsche-design-system/components-react';
import releaseNotes from '../../../config/release-notes.json';

export const ReleaseNotes: FC = () => {
    return (
        <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e0e0e0', marginTop: '3rem' }}>
            <PHeading size="medium" style={{ marginBottom: '1.5rem' }}>Release Notes</PHeading>
            {releaseNotes.map((note, idx) => (
                <div key={note.version} style={{ marginBottom: idx === releaseNotes.length - 1 ? 0 : '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <PHeading size="small">Version {note.version}: {note.title}</PHeading>
                        <PText size="x-small" color="contrast-medium">{note.date}</PText>
                    </div>
                    <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem' }}>
                        {note.changes.map((change, cIdx) => (
                            <li key={cIdx} style={{ marginBottom: '0.5rem' }}>
                                <PText size="small">{change}</PText>
                            </li>
                        ))}
                    </ul>
                    {idx !== releaseNotes.length - 1 && <PDivider style={{ marginTop: '1.5rem' }} />}
                </div>
            ))}
        </div>
    );
};
