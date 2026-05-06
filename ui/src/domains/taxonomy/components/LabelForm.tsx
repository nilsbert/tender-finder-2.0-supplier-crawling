import React, { useState } from 'react';
import {PButton,
    PTextFieldWrapper,
    PTextarea,
    PInlineNotification,
    PFlex,
    PFlexItem} from '@porsche-design-system/components-react';
import { taxonomyApi, Label, LabelCreate } from '../taxonomyApi';

interface Props {
    initialData?: Label | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export const LabelForm: React.FC<Props> = ({ initialData, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState<LabelCreate>({
        name: initialData?.name || '',
        description: initialData?.description || '',
        type: initialData?.type || 'CUSTOM',
        active: initialData?.active ?? true
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (initialData) {
                // Update
                await taxonomyApi.updateLabel(initialData.id, {
                    name: formData.name,
                    description: formData.description,
                    active: formData.active
                });
            } else {
                // Create
                await taxonomyApi.createLabel(formData);
            }
            onSuccess();
        } catch (e: any) {
            setError(e.message || "Failed to save label");
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {error && <PInlineNotification state="error" heading="Error" description={error} />}

            <PTextFieldWrapper label="Label Name" description="Unique name for the distribution label (e.g. 'Automotive')">
                <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
            </PTextFieldWrapper>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '16px', fontWeight: 'bold' }}>Type</label>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Choose a classification type</div>
                <select
                    value={formData.type}
                    disabled={!!initialData}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    style={{
                        padding: '12px',
                        width: '100%',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        backgroundColor: 'white',
                        fontSize: '16px'
                    }}
                >
                    <option value="SECTOR">Sector (Branche)</option>
                    <option value="SERVICE">Service (Leistung)</option>
                    <option value="CUSTOM">Custom (Spezifisch)</option>
                </select>
            </div>

            <PTextarea
                name="label_description"
                label="Description for AI Matching"
                description="Describe what tenders fall under this label. The AI uses this for semantic matching."
                value={formData.description}
                onInput={(e: any) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
            />

            <PFlex style={{ gap: '16px', marginTop: '12px' }}>
                <PFlexItem>
                    <PButton type="submit" loading={loading} disabled={loading}>
                        {initialData ? 'Update Label' : 'Create Label'}
                    </PButton>
                </PFlexItem>
                <PFlexItem>
                    <PButton variant="ghost" onClick={onCancel} disabled={loading}>
                        Cancel
                    </PButton>
                </PFlexItem>
            </PFlex>
        </form>
    );
};
