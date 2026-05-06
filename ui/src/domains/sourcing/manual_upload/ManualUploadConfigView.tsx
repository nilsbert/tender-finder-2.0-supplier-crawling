import { useEffect, useState, type FC } from 'react';
import {PButton, PHeading, PInlineNotification, PTextareaWrapper, PText} from '@porsche-design-system/components-react';
import { manualUploadApi } from './api';

const DEFAULT_PROMPT = `You are an assistant that extracts structured tender metadata.
Return a compact JSON object with these fields:
- headline (string)
- description (2-3 sentences)
- caller (issuer/authority)
- location (city/region/country)
- due (ISO datetime)
- published (ISO date)
- est_volume (string with currency if present)
- tender_type (string/category)
- cpv_codes (array of strings)
- url (if present)
- full_text (optional pass-through of source text)

Use the language of the document. Keep JSON strictly valid. If a field is unknown, set it to null or an empty array.
`;

const ManualUploadConfigView: FC = () => {
    const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState<{ status: 'success' | 'error'; message: string } | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await manualUploadApi.getConfig();
                if (data?.prompt_template) {
                    setPrompt(data.prompt_template);
                }
            } catch (e) {
                setNotification({ status: 'error', message: 'Failed to load prompt config. Using default.' });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setNotification(null);
        try {
            await manualUploadApi.saveConfig(prompt);
            setNotification({ status: 'success', message: 'Prompt saved.' });
        } catch (e: any) {
            setNotification({ status: 'error', message: e?.response?.data?.detail || 'Failed to save prompt.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            border: '1px solid #f0f0f0'
        }}>
            <PHeading size="medium" style={{ marginBottom: '8px' }}>Manual Upload Prompt</PHeading>
            <PText color="contrast-medium" style={{ marginBottom: '24px', maxWidth: '700px' }}>
                Edit the AI prompt used to extract tender metadata from uploaded documents. The PDF text is appended automatically to the prompt.
            </PText>

            {notification && (
                <div style={{ marginBottom: '24px' }}>
                    <PInlineNotification
                        state={notification.status}
                        heading={notification.status === 'success' ? 'Saved' : 'Error'}
                        description={notification.message}
                    />
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                    <PTextareaWrapper label="Prompt Template">
                        <textarea
                            name="prompt"
                            value={prompt}
                            disabled={loading}
                            onInput={(e) => setPrompt((e.target as HTMLTextAreaElement).value)}
                            rows={12}
                        />
                    </PTextareaWrapper>
                    <PText size="x-small" color="contrast-medium" style={{ marginTop: '8px' }}>
                        The extracted document text will be appended below this prompt before calling the AI.
                    </PText>
                </div>

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', paddingTop: '8px' }}>
                    <PButton variant="tertiary" onClick={() => setPrompt(DEFAULT_PROMPT)} disabled={loading || saving}>
                        Reset to Default
                    </PButton>
                    <PButton loading={saving} onClick={handleSave} disabled={loading}>
                        Save Prompt
                    </PButton>
                </div>
            </div>
        </div>
    );
};

export default ManualUploadConfigView;
