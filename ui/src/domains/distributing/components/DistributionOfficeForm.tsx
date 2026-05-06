import React, { useState } from 'react';
import {PButton,
    PTextFieldWrapper,
    PTextarea,
    PInlineNotification,
    PFlex,
    PFlexItem} from '@porsche-design-system/components-react';
import { distributingApi, DistributionOffice } from '../api/distributingApi';

interface Props {
    initialData?: DistributionOffice | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export const DistributionOfficeForm: React.FC<Props> = ({ initialData, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState<Partial<DistributionOffice>>({
        name: initialData?.name || '',
        description: initialData?.description || '',
        city: initialData?.city || '',
        state: initialData?.state || '',
        country: initialData?.country || '',
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
                await distributingApi.updateOffice(initialData.id, formData);
            } else {
                await distributingApi.createOffice(formData);
            }
            onSuccess();
        } catch (e: any) {
            setError(e.message || "Failed to save office");
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {error && <PInlineNotification state="error" heading="Error" description={error} />}

            <PTextFieldWrapper label="Office Name" description="Unique name for the office (e.g. 'MHP Ludwigsburg')">
                <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
            </PTextFieldWrapper>

            <PTextFieldWrapper label="City">
                <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
            </PTextFieldWrapper>

            <PTextFieldWrapper label="State / Province">
                <input
                    type="text"
                    value={formData.state || ''}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
            </PTextFieldWrapper>

            <PTextFieldWrapper label="Country">
                <input
                    type="text"
                    value={formData.country || ''}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
            </PTextFieldWrapper>


            <PTextarea
                name="office_description"
                label="Description"
                description="Optional details about this office."
                value={formData.description}
                onInput={(e: any) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
            />

            <PFlex style={{ gap: '16px', marginTop: '12px' }}>
                <PFlexItem>
                    <PButton type="submit" loading={loading} disabled={loading}>
                        {initialData ? 'Update Office' : 'Create Office'}
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
