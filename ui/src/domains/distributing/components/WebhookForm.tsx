import React, { useState, useEffect } from 'react';
import {PTextFieldWrapper,
    PButton,
    PSelectWrapper,
    PInlineNotification} from '@porsche-design-system/components-react';
// TreeSelect component removed – using native <select>
import 'rc-tree/assets/index.css';
// rc-tree-select styles not needed for native select
import 'rc-select/assets/index.css';
import './TreeSelectPds.css';
import { Webhook, WebhookCreate, distributingApi, Label, DistributionOffice } from '../api/distributingApi';

interface Props {
    initialData?: Webhook | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export const WebhookForm: React.FC<Props> = ({ initialData, onSuccess, onCancel }) => {
    // Basic fields
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');

    // Label Selection state
    const [labels, setLabels] = useState<Label[]>([]);
    const [selectedLabelId, setSelectedLabelId] = useState<string>('ALL');

    // Office Selection state
    const [offices, setOffices] = useState<DistributionOffice[]>([]);
    const [selectedOfficeId, setSelectedOfficeId] = useState<string>('NONE');

    const [matchThreshold, setMatchThreshold] = useState<number | ''>('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load initial data into form fields
    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setUrl(initialData.webhook_url);
            setSelectedLabelId(initialData.label_id || 'ALL');
            setSelectedOfficeId(initialData.office_id || 'NONE');
            setMatchThreshold(initialData.match_threshold ?? '');
        } else {
            setName('');
            setUrl('');
            setSelectedLabelId('ALL');
            setSelectedOfficeId('NONE');
            setMatchThreshold('');
        }
    }, [initialData]);

    // Fetch Labels & Offices
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [labelsData, officesData] = await Promise.all([
                    distributingApi.getLabels(),
                    distributingApi.getOffices()
                ]);
                setLabels(labelsData);
                setOffices(officesData);
            } catch (e) {
                console.error('Failed to fetch distribution data', e);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            const payload: WebhookCreate = {
                name,
                webhook_url: url,
                label_id: selectedLabelId === 'ALL' ? undefined : selectedLabelId,
                office_id: selectedOfficeId === 'NONE' ? undefined : selectedOfficeId,
                match_threshold: matchThreshold === '' ? undefined : Number(matchThreshold),
                scope_type: (selectedLabelId === 'ALL' && selectedOfficeId === 'NONE') ? 'ALL' : undefined,
            };
            if (initialData) {
                await distributingApi.updateWebhook(initialData.id, payload);
            } else {
                await distributingApi.createWebhook(payload);
            }
            onSuccess();
        } catch (e: any) {
            setError(e.message || 'Operation failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl bg-white p-6 rounded shadow-sm border border-gray-100">
            {error && <PInlineNotification state="error" heading="Error" description={error} />}

            <PTextFieldWrapper label="Name">
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                />
            </PTextFieldWrapper>

            <PTextFieldWrapper label="Webhook URL" description="Must be a valid MS Teams Incoming Webhook URL">
                <input
                    type="url"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    required
                />
            </PTextFieldWrapper>
            <PSelectWrapper label="Subscription Label" description="Select which label matching triggers this webhook.">
                <select
                    value={selectedLabelId}
                    onChange={e => setSelectedLabelId(e.target.value)}
                    className="pds-select"
                    style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #e3e4e5', backgroundColor: 'white' }}
                >
                    <option value="ALL">All Tenders (Global Rating)</option>
                    <optgroup label="Sectors">
                        {labels.filter(l => l.type === 'SECTOR').map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.name}</option>
                        ))}
                    </optgroup>
                    <optgroup label="Services">
                        {labels.filter(l => l.type === 'SERVICE').map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.name}</option>
                        ))}
                    </optgroup>
                    <optgroup label="Custom">
                        {labels.filter(l => l.type === 'CUSTOM').map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.name}</option>
                        ))}
                    </optgroup>
                </select>
            </PSelectWrapper>

            <PSelectWrapper label="Subscription Office (Optional)" description="Select an office to direct this webhook towards.">
                <select
                    value={selectedOfficeId}
                    onChange={e => setSelectedOfficeId(e.target.value)}
                    className="pds-select"
                    style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #e3e4e5', backgroundColor: 'white' }}
                >
                    <option value="NONE">None (Matches all Locations)</option>
                    {offices.map(off => (
                        <option key={off.id} value={off.id}>{off.name}</option>
                    ))}
                </select>
            </PSelectWrapper>

            <div className="flex gap-4 pt-4 border-t mt-4">
                <PButton type="submit" loading={isSubmitting}>
                    {initialData ? 'Update Webhook' : 'Create Webhook'}
                </PButton>
                <PButton type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </PButton>
            </div>
        </form>
    );
};
