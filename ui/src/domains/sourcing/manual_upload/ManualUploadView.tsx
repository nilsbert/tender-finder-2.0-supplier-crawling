import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import {PHeading, PText, PButton, PInlineNotification, PTag, PTextFieldWrapper, PTextareaWrapper} from '@porsche-design-system/components-react';
import { manualUploadApi, type ManualUpload, type TenderMetadataInput } from './api';

type FormState = TenderMetadataInput & { cpvString: string };

const emptyForm: FormState = {
    headline: '',
    description: '',
    caller: '',
    location: '',
    due: '',
    published: '',
    est_volume: '',
    tender_type: '',
    cpv_codes: [],
    cpvString: '',
    url: '',
    full_text: '',
};

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ManualUploadView = () => {
    const { t } = useTranslation();
    const [file, setFile] = useState<File | null>(null);
    const [upload, setUpload] = useState<ManualUpload | null>(null);
    const [form, setForm] = useState<FormState>({ ...emptyForm });
    const [uploading, setUploading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [dirtyForm, setDirtyForm] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const chosen = e.target.files?.[0];
        if (!chosen) return;
        const isPdf = chosen.type === 'application/pdf' || chosen.name.toLowerCase().endsWith('.pdf');
        if (!isPdf) {
            setError(t('manual_upload.messages.error_pdf_only'));
            setFile(null);
            return;
        }
        if (chosen.size > MAX_FILE_SIZE_BYTES) {
            setError(t('manual_upload.messages.error_file_too_large', { max: MAX_FILE_SIZE_MB }));
            setFile(null);
            return;
        }
        setFile(chosen);
        setError(null);
        setSuccess(null);
    };

    const prefillFromMetadata = (meta?: Record<string, any>) => {
        if (!meta) return;
        setForm(prev => ({
            ...prev,
            headline: meta.headline || prev.headline,
            description: meta.description || prev.description,
            caller: meta.caller || prev.caller,
            location: meta.location || prev.location,
            due: meta.due || prev.due,
            published: meta.published || prev.published,
            est_volume: meta.est_volume || prev.est_volume,
            tender_type: meta.tender_type || prev.tender_type,
            cpv_codes: meta.cpv_codes || prev.cpv_codes,
            cpvString: Array.isArray(meta.cpv_codes) ? meta.cpv_codes.join(', ') : prev.cpvString,
            url: meta.url || prev.url,
            full_text: meta.full_text || prev.full_text,
        }));
    };

    const handleUpload = async () => {
        if (!file) {
            setError(t('manual_upload.messages.error_select_file'));
            return;
        }
        setUploading(true);
        setError(null);
        setSuccess(null);
        setUpload(null);
        setDirtyForm(false);
        setForm({ ...emptyForm });

        try {
            const result = await manualUploadApi.uploadFile(file);
            setUpload(result);
            prefillFromMetadata(result.extracted_metadata || undefined);
        } catch (e: any) {
            setError(e?.response?.data?.detail || t('manual_upload.messages.error_upload_failed'));
        } finally {
            setUploading(false);
        }
    };

    // Poll for processing status until completed/failed
    useEffect(() => {
        if (!upload?.id) return;
        if (upload.status === 'completed' || upload.status === 'failed') return;

        const interval = setInterval(async () => {
            try {
                const status = await manualUploadApi.getStatus(upload.id);
                setUpload(status);
                if (!dirtyForm && status.status === 'completed') {
                    prefillFromMetadata(status.extracted_metadata || undefined);
                }
            } catch (e: any) {
                setError(e?.response?.data?.detail || t('manual_upload.messages.error_status_check'));
            }
        }, 2000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [upload?.id, upload?.status, dirtyForm]);

    const formattedStatus = useMemo(() => {
        if (!upload) return null;
        switch (upload.status) {
            case 'queued': return { label: t('manual_upload.status.queued'), color: 'notification-info-soft' as const };
            case 'processing': return { label: t('manual_upload.status.processing'), color: 'notification-info-soft' as const };
            case 'completed': return { label: t('manual_upload.status.completed'), color: 'notification-success-soft' as const };
            case 'failed': return { label: t('manual_upload.status.failed'), color: 'notification-error-soft' as const };
            default: return { label: upload.status, color: 'notification-info-soft' as const };
        }
    }, [upload, t]);

    const resetState = () => {
        setUpload(null);
        setFile(null);
        setForm({ ...emptyForm });
        setDirtyForm(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRefill = () => {
        if (!form.full_text || !form.full_text.trim()) {
            setError(t('manual_upload.messages.error_refill_empty'));
            return;
        }
        prefillFromMetadata(upload?.extracted_metadata || undefined);
    };

    const handleCreateTender = async () => {
        if (!upload?.id) {
            setError(t('manual_upload.messages.error_missing_upload'));
            return;
        }
        if (!form.headline.trim()) {
            setError(t('manual_upload.messages.error_headline_required'));
            return;
        }

        // Final validation check before creation
        const newErrors: Record<string, string> = {};
        if (form.url && !/^https?:\/\//i.test(form.url)) {
            newErrors.url = "URL must start with http:// or https://";
        }
        if (form.est_volume && isNaN(Number(form.est_volume))) {
            newErrors.est_volume = "Volume must be a numeric value";
        }
        if (form.cpvString) {
            const parts = form.cpvString.split(',').map(s => s.trim()).filter(Boolean);
            const invalidCpvs = parts.filter(p => !/^\d{8}(-\d+)?$/.test(p));
            if (invalidCpvs.length > 0) {
                newErrors.cpvString = `Invalid CPV codes: ${invalidCpvs.join(', ')} (must be 8 digits)`;
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            setError(t('manual_upload.messages.error_validation_failed') || "Please fix validation errors before creating.");
            return;
        }

        setCreating(true);
        setError(null);
        setSuccess(null);
        try {
            const payload: TenderMetadataInput = {
                headline: form.headline,
                description: form.description || undefined,
                caller: form.caller || undefined,
                location: form.location || undefined,
                due: form.due ? new Date(form.due).toISOString() : undefined,
                published: form.published ? new Date(form.published).toISOString() : undefined,
                est_volume: form.est_volume || undefined,
                tender_type: form.tender_type || undefined,
                cpv_codes: form.cpvString ? form.cpvString.split(',').map(c => c.trim()).filter(Boolean) : [],
                url: form.url || undefined,
                full_text: form.full_text || undefined,
            };

            const result = await manualUploadApi.createTender(upload.id, payload);
            setSuccess(t('manual_upload.messages.success_created', { id: result.tender_id }));
            resetState();
        } catch (e: any) {
            setError(e?.response?.data?.detail || t('manual_upload.messages.error_create_failed'));
        } finally {
            setCreating(false);
        }
    };

    const onFieldChange = (key: keyof FormState, value: string) => {
        setDirtyForm(true);
        setForm(prev => ({ ...prev, [key]: value }));

        // Real-time validation
        let errorMsg = "";
        if (key === 'url') {
            if (value && !/^https?:\/\//i.test(value)) errorMsg = "Must start with http:// or https://";
        } else if (key === 'est_volume') {
            if (value && isNaN(Number(value))) errorMsg = "Must be a number";
        } else if (key === 'cpvString') {
            const parts = value.split(',').map(s => s.trim()).filter(Boolean);
            if (parts.some(p => !/^\d{8}(-\d+)?$/.test(p))) errorMsg = "Codes must be 8 digits (comma separated)";
        }

        setFieldErrors(prev => {
            const next = { ...prev };
            if (errorMsg) next[key] = errorMsg;
            else delete next[key];
            return next;
        });
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <PHeading size="medium" style={{ marginBottom: '12px' }}>{t('manual_upload.title')}</PHeading>
            <PText color="contrast-medium" style={{ marginBottom: '24px' }}>
                {t('manual_upload.subtitle')}
            </PText>

            {error && (
                <PInlineNotification state="error" heading={t('common.error')} description={error} style={{ marginBottom: '4px' }} />
            )}
            {success && (
                <PInlineNotification state="success" heading={t('common.success')} description={success} style={{ marginBottom: '4px' }} />
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    border: '1px solid #f0f0f0'
                }}>
                    <div style={{
                        border: '2px dashed #d0d0d0',
                        borderRadius: '10px',
                        padding: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        flexWrap: 'wrap'
                    }}>
                        <div>
                            <PHeading size="small">{t('manual_upload.upload_section.title')}</PHeading>
                            <PText size="small" color="contrast-medium">
                                {t('manual_upload.upload_section.hint')}
                            </PText>
                            {file && (
                                <PText size="small" style={{ marginTop: '6px' }}>
                                    {t('manual_upload.upload_section.selected')}: <strong>{file.name}</strong> ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </PText>
                            )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,application/pdf"
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                            <PButton variant="secondary" onClick={() => fileInputRef.current?.click()}>
                                {t('manual_upload.upload_section.choose_file')}
                            </PButton>
                            <PButton loading={uploading} disabled={!file || uploading} onClick={handleUpload}>
                                {t('manual_upload.upload_section.upload_extract')}
                            </PButton>
                        </div>
                    </div>

                    {upload && (
                        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <PTag color={formattedStatus?.color || 'notification-info-soft'}>{formattedStatus?.label || upload.status}</PTag>
                            <PText size="small" color="contrast-medium">Upload ID: {upload.id}</PText>
                            {upload.error_message && <span style={{ fontSize: '13px', color: '#c62828' }}>Error: {upload.error_message}</span>}
                        </div>
                    )}
                </div>

                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    border: '1px solid #f0f0f0'
                }}>
                    <PHeading size="small" style={{ marginBottom: '12px' }}>{t('manual_upload.review_section.title')}</PHeading>
                    <PText size="small" color="contrast-medium" style={{ marginBottom: '16px' }}>
                        {t('manual_upload.review_section.hint')}
                    </PText>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                        <Field label={t('manual_upload.review_section.headline')} required value={form.headline} onChange={v => onFieldChange('headline', v)} error={fieldErrors.headline} />
                        <Field label={t('manual_upload.review_section.caller')} value={form.caller || ''} onChange={v => onFieldChange('caller', v)} error={fieldErrors.caller} />
                        <Field label={t('manual_upload.review_section.location')} value={form.location || ''} onChange={v => onFieldChange('location', v)} error={fieldErrors.location} />
                        <Field label={t('manual_upload.review_section.tender_type')} value={form.tender_type || ''} onChange={v => onFieldChange('tender_type', v)} error={fieldErrors.tender_type} />
                        <Field label={t('manual_upload.review_section.est_volume')} value={form.est_volume || ''} onChange={v => onFieldChange('est_volume', v)} error={fieldErrors.est_volume} />
                        <Field label={t('manual_upload.review_section.cpv_codes')} value={form.cpvString} onChange={v => onFieldChange('cpvString', v)} error={fieldErrors.cpvString} description="Comma separated, e.g. 72000000, 45000000" />
                        <Field label={t('manual_upload.review_section.due_date')} type="date" value={form.due ? toLocalDate(form.due) : ''} onChange={v => onFieldChange('due', v)} error={fieldErrors.due} />
                        <Field label={t('manual_upload.review_section.published_date')} type="date" value={form.published ? toLocalDate(form.published) : ''} onChange={v => onFieldChange('published', v)} error={fieldErrors.published} />
                        <Field label={t('manual_upload.review_section.source_url')} value={form.url || ''} onChange={v => onFieldChange('url', v)} error={fieldErrors.url} />
                    </div>

                    <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                        <Field label={t('manual_upload.review_section.description')} multiline value={form.description || ''} onChange={v => onFieldChange('description', v)} error={fieldErrors.description} />
                        <Field label={t('manual_upload.review_section.full_text')} multiline rows={6} value={form.full_text || ''} onChange={v => onFieldChange('full_text', v)} error={fieldErrors.full_text} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                        <PButton variant="tertiary" disabled={!upload || upload.status !== 'completed'} onClick={handleRefill}>
                            {t('manual_upload.review_section.refill')}
                        </PButton>
                        <PButton loading={creating} disabled={!upload || upload.status !== 'completed'} onClick={handleCreateTender}>
                            {t('manual_upload.review_section.create')}
                        </PButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface FieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    type?: string;
    multiline?: boolean;
    rows?: number;
    error?: string;
    description?: string;
}

const Field: FC<FieldProps> = ({ label, value, onChange, required = false, type = 'text', multiline = false, rows = 3, error, description }) => (
    <div>
        {multiline ? (
            <PTextareaWrapper
                label={label + (required ? ' *' : '')}
                state={error ? 'error' : 'none'}
                message={error || ''}
                description={description}
            >
                <textarea
                    value={value}
                    rows={rows}
                    required={required}
                    onChange={e => onChange(e.target.value)}
                />
            </PTextareaWrapper>
        ) : (
            <PTextFieldWrapper
                label={label + (required ? ' *' : '')}
                state={error ? 'error' : 'none'}
                message={error || ''}
                description={description}
            >
                <input
                    type={type}
                    value={value}
                    required={required}
                    onChange={e => onChange(e.target.value)}
                />
            </PTextFieldWrapper>
        )}
    </div>
);

const toLocalDate = (value: string) => {
    try {
        return new Date(value).toISOString().slice(0, 10);
    } catch {
        return '';
    }
};

export default ManualUploadView;
