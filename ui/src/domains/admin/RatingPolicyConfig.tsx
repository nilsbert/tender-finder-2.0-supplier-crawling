import { type FC, useEffect, useState } from 'react';
import {PHeading,
    PText,
    PButton,
    PFlex,
    PFlexItem,
    PTextFieldWrapper,
    PSpinner,
    PInlineNotification} from '@porsche-design-system/components-react';
import { StandardPageHeader } from '../../components/StandardPageHeader';
import { adminApi, type RatingPolicyConfig } from './api';

export const RatingPolicyConfigView: FC = () => {
    const [config, setConfig] = useState<RatingPolicyConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getRatingConfig();
            setConfig(data);
        } catch (err) {
            console.error('Failed to fetch rating config', err);
            setError('Failed to load rating configuration.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!config) return;
        try {
            setSaving(true);
            setError(null);
            setSuccess(false);
            await adminApi.updateRatingConfig(config);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError('Failed to save configuration.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '24px' }}>
                <PText>Loading configuration...</PText>
            </div>
        );
    }

    return (
        <div className="p-content-wrapper">
            <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <StandardPageHeader
                    title="Rating & Distribution Thresholds"
                    subtitle="Configure the minimum scores required for a tender to be processed and distributed. A tender is processed if either the Overall Score OR the Title Score meets its respective threshold."
                />

                {error && (
                    <PInlineNotification state="error" description={error} />
                )}

                {success && (
                    <PInlineNotification state="success" description="Configuration saved successfully." />
                )}

                <PFlex direction="column" style={{ gap: '16px', maxWidth: '400px' }}>
                    <PTextFieldWrapper label="Overall Score Threshold" description="Minimum total score for distribution">
                        <input
                            type="number"
                            value={config?.overall_threshold}
                            onChange={(e) => setConfig(prev => prev ? { ...prev, overall_threshold: parseFloat(e.target.value) } : null)}
                            style={{ fontSize: '14px', height: '42px', padding: '0 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
                        />
                    </PTextFieldWrapper>

                    <PTextFieldWrapper label="Title Score Threshold" description="Minimum title-only score for distribution">
                        <input
                            type="number"
                            value={config?.title_threshold}
                            onChange={(e) => setConfig(prev => prev ? { ...prev, title_threshold: parseFloat(e.target.value) } : null)}
                            style={{ fontSize: '14px', height: '42px', padding: '0 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
                        />
                    </PTextFieldWrapper>

                    <div style={{ marginTop: '16px' }}>
                        <PButton loading={saving} onClick={handleSave}>Save Rating Policy</PButton>
                    </div>
                </PFlex>

                {config?.last_updated_at && (
                    <PText size="x-small" color="contrast-medium">
                        Last updated: {new Date(config.last_updated_at).toLocaleString()}
                    </PText>
                )}
            </div>
        </div>
    );
};
