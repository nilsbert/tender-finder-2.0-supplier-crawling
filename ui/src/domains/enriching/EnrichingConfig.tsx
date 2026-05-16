import React, { useState, useEffect } from 'react'
import {
    PButton,
    PFlex,
    PFlexItem,
    PHeading,
    PText,
    PTextFieldWrapper,
    PInlineNotification,
    PTextarea,
    PTabs,
    PTabsItem,
    PModal,
    PLink
} from '../../pds-wrapper';
import { StandardPageHeader } from '../../components/StandardPageHeader'
import { api as enrichingApi, type EnrichmentConfig } from './api'
import { aiApi, type AIConnectorConfig } from '../ai/api'
import { PromptTemplateLibrary } from './PromptTemplateLibrary'
import { distributingApi, type DistributionOffice } from '../distributing/api/distributingApi'
import { taxonomyApi, type Label } from '../taxonomy/taxonomyApi'

const EnrichingConfigView: React.FC = () => {
    const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
    const [config, setConfig] = useState<EnrichmentConfig>({
        enrichment_threshold: 800,
        enrichment_worker_count: 2,
        prompt_tender_status_detection: '',
        prompt_field_enrichment: '',

        prompt_summary_generation: '',
        prompt_bid_team_onepager: '',
        prompt_office_matching: '',
        profile_requirements_enabled: true,
        prompt_profile_requirements: '',
        max_profile_requirements: 10,
        model_profile_requirements: '',
        reference_requirements_enabled: true,
        prompt_reference_requirements: '',
        max_reference_requirements: 5,
        model_reference_requirements: '',
        prompt_chat_with_tender: '',
        label_matching_enabled: true,
        prompt_label_matching: '',
        prompt_distribution_matching: ''
    })
    const [activeAI, setActiveAI] = useState<AIConnectorConfig | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [notification, setNotification] = useState<{ status: 'success' | 'error', message: string } | null>(null)
    const [activeTab, setActiveTab] = useState(0)
    const [isForceModalOpen, setIsForceModalOpen] = useState(false)
    const [offices, setOffices] = useState<DistributionOffice[]>([])
    const [labels, setLabels] = useState<Label[]>([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [configData, aiData, officesData, labelsData] = await Promise.all([
                    enrichingApi.getConfig(),
                    aiApi.getActiveConfig(),
                    distributingApi.getOffices(),
                    taxonomyApi.getLabels()
                ])
                if (configData) setConfig(configData)
                if (aiData) setActiveAI(aiData)
                if (officesData) setOffices(officesData.filter(o => o.active))
                if (labelsData) setLabels(labelsData.filter(l => l.active))
            } catch (error) {
                console.error("Failed to load enriching config", error)
                setNotification({ status: 'error', message: 'Failed to load configuration.' })
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setNotification(null)
        try {
            await enrichingApi.saveConfig(config)
            setNotification({ status: 'success', message: 'Configuration saved successfully.' })
        } catch (error) {
            console.error("Failed to save enriching config", error)
            setNotification({ status: 'error', message: 'Failed to save configuration.' })
        } finally {
            setSaving(false)
        }
    }

    const handleRunBatch = async () => {
        setSaving(true)
        setNotification(null)
        try {
            await enrichingApi.startBatch(false)
            setNotification({ status: 'success', message: 'Retroactive batch enrichment started.' })
        } catch (error) {
            console.error("Failed to start batch", error)
            setNotification({ status: 'error', message: 'Failed to start batch enrichment.' })
        } finally {
            setSaving(false)
        }
    }

    const handleRunForceBatch = async () => {
        setIsForceModalOpen(true)
    }

    const confirmForceBatch = async () => {
        setIsForceModalOpen(false)
        setSaving(true)
        setNotification(null)
        try {
            await enrichingApi.startBatch(true)
            setNotification({ status: 'success', message: 'Full force-enrichment batch started.' })
        } catch (error) {
            console.error("Failed to start force batch", error)
            setNotification({ status: 'error', message: 'Failed to start force enrichment.' })
        } finally {
            setSaving(false)
        }
    }

    const handleRetryAll = async () => {
        setSaving(true)
        setNotification(null)
        try {
            await enrichingApi.retryAllFailed()
            setNotification({ status: 'success', message: 'Successfully enqueued all failed items for retry.' })
        } catch (error) {
            console.error("Failed to retry all", error)
            setNotification({ status: 'error', message: 'Failed to retry failed items.' })
        } finally {
            setSaving(false)
        }
    }

    const handleSelectTemplate = (promptType: 'field_enrichment' | 'summary_generation' | 'bid_onepager' | 'label_matching', template: string) => {
        // Map the template type to the config field
        if (promptType === 'field_enrichment') {
            setConfig({ ...config, prompt_field_enrichment: template });
        } else if (promptType === 'summary_generation') {
            setConfig({ ...config, prompt_summary_generation: template });
        } else if (promptType === 'bid_onepager') {
            setConfig({ ...config, prompt_bid_team_onepager: template });
        } else if (promptType === 'label_matching') {
            setConfig({ ...config, prompt_label_matching: template });
        }
        setNotification({ status: 'success', message: 'Template loaded successfully. Don\'t forget to save!' });
    };


    if (loading) {
        return <PText>Loading...</PText>
    }

    return (
        <div className="p-content-wrapper">
            <div style={{ padding: '0 24px' }}>
                <StandardPageHeader
                    title="Enrichment Configuration"
                    subtitle="Configure global settings and AI prompts."
                >
                    {notification && (
                        <div style={{ marginBottom: '24px' }}>
                            <PInlineNotification
                                state={notification.status}
                                heading={notification.status === 'success' ? 'Success' : 'Error'}
                                description={notification.message}
                            />
                        </div>
                    )}

                    {/* Active AI Display */}


                    <div style={{ marginTop: '16px', marginBottom: '8px' }}>
                        <PButton variant="secondary" icon="list" onClick={() => setShowTemplateLibrary(true)}>
                            Load from Template Library
                        </PButton>
                    </div>

                    <form onSubmit={handleSave} style={{ marginTop: '24px' }}>
                        <PTabs activeTabIndex={activeTab} onUpdate={(e: any) => setActiveTab(e.activeTabIndex)}>
                            <PTabsItem label="General">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '24px' }}>
                                    <PText>Global settings for the enrichment pipeline.</PText>

                                    <PTextFieldWrapper label="Enrichment Threshold (0-1000)" description="Tenders with a score above this value will be automatically enriched.">
                                        <input
                                            type="number"
                                            min="0"
                                            max="1000"
                                            value={config.enrichment_threshold}
                                            onChange={(e) => setConfig({ ...config, enrichment_threshold: parseInt(e.target.value) || 0 })}
                                        />
                                    </PTextFieldWrapper>

                                    <PTextFieldWrapper
                                        label="Enrichment Worker Count"
                                        description="Number of concurrent enrichment workers. Changes apply when workers start."
                                    >
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={config.enrichment_worker_count}
                                            onChange={(e) => setConfig({ ...config, enrichment_worker_count: parseInt(e.target.value) || 1 })}
                                        />
                                    </PTextFieldWrapper>

                                    <div style={{ padding: '24px', backgroundColor: '#f0f0f0', borderRadius: '4px', marginTop: '16px' }}>
                                        <PHeading size="small">Bulk Operations</PHeading>
                                        <PText style={{ marginBottom: '16px' }}>
                                            Manage the enrichment queue for existing tenders.
                                        </PText>

                                        <PFlex style={{ gap: '16px', flexWrap: 'wrap' }}>
                                            <PFlexItem>
                                                <PButton variant="secondary" onClick={handleRunBatch} loading={saving}>
                                                    Run Retroactive Batch
                                                </PButton>
                                                <PText size="x-small" style={{ marginTop: '4px' }}>Enrich qualifying unenriched tenders</PText>
                                            </PFlexItem>

                                            <PFlexItem>
                                                <PButton variant="secondary" onClick={handleRetryAll} loading={saving}>
                                                    Retry Failed items
                                                </PButton>
                                                <PText size="x-small" style={{ marginTop: '4px' }}>Retry all items with FAILED status</PText>
                                            </PFlexItem>

                                            <PFlexItem>
                                                <PButton variant="secondary" onClick={handleRunForceBatch} loading={saving} icon="delete">
                                                    Force Re-enrich All
                                                </PButton>
                                                <PText size="x-small" style={{ marginTop: '1px' }}>Overwrite current enrichments</PText>
                                            </PFlexItem>
                                        </PFlex>
                                    </div>
                                </div>
                            </PTabsItem>

                            <PTabsItem label="Status Detection">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '24px' }}>
                                    <PHeading size="small">Stage 0: Status Detection Prompt</PHeading>
                                    <PText>This prompt analyzes the tender's current state and determines its AI status classification (e.g. valid, invalid, framework, etc.).</PText>
                                    <PTextarea
                                        name="statusDetectionPrompt"
                                        label="Prompt Template"
                                        value={config.prompt_tender_status_detection}
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        onInput={(e: any) => {
                                            setConfig({ ...config, prompt_tender_status_detection: e.target.value });
                                        }}
                                        rows={18}
                                    />
                                </div>
                            </PTabsItem>

                            <PTabsItem label="Field Enrichment">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '24px' }}>
                                    <PHeading size="small">Stage 1: Field Enrichment Prompt</PHeading>
                                    <PText>This prompt fills missing tender data (headline, caller, location, dates, etc.) when not captured by crawlers.</PText>
                                    <PTextarea
                                        name="fieldEnrichmentPrompt"
                                        label="Prompt Template"
                                        value={config.prompt_field_enrichment}
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        onInput={(e: any) => {
                                            setConfig({ ...config, prompt_field_enrichment: e.target.value });
                                        }}
                                        rows={18}
                                    />
                                </div>
                            </PTabsItem>


                            <PTabsItem label="Summary Generation">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '24px' }}>
                                    <PHeading size="small">Stage 3: Summary Generation Prompt</PHeading>
                                    <PText>This prompt generates both a short summary (for tables) and a full summary (for detail views). Returns JSON with short_summary and full_summary.</PText>
                                    <PTextarea
                                        name="summaryPrompt"
                                        label="Prompt Template"
                                        value={config.prompt_summary_generation}
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        onInput={(e: any) => {
                                            setConfig({ ...config, prompt_summary_generation: e.target.value });
                                        }}
                                        rows={15}
                                    />
                                </div>
                            </PTabsItem>

                            <PTabsItem label="Bid Onepager">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '24px' }}>
                                    <PHeading size="small">Stage 4: Bid Team One-Pager Prompt</PHeading>
                                    <PText>Define the prompt for generating a comprehensive markdown one-pager for the bid team.</PText>
                                    <PTextarea
                                        name="bidOnepagerPrompt"
                                        label="Prompt Template"
                                        value={config.prompt_bid_team_onepager}
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        onInput={(e: any) => {
                                            setConfig({ ...config, prompt_bid_team_onepager: e.target.value });
                                        }}
                                        rows={20}
                                    />
                                </div>
                            </PTabsItem>

                            <PTabsItem label="Profile Requirements">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '24px' }}>
                                    <PHeading size="small">Stage 5: Profile Requirements Enricher</PHeading>
                                    <PText>Extract required roles and skill profiles from the tender.</PText>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <input
                                            type="checkbox"
                                            checked={config.profile_requirements_enabled}
                                            onChange={(e) => setConfig({ ...config, profile_requirements_enabled: e.target.checked })}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <PText weight="semi-bold">Enable Profile Requirements</PText>
                                    </div>
                                    <PTextFieldWrapper label="Max Items" description="Maximum number of profile requirements to return.">
                                        <input
                                            type="number"
                                            min="1"
                                            max="50"
                                            value={config.max_profile_requirements}
                                            onChange={(e) => setConfig({ ...config, max_profile_requirements: parseInt(e.target.value) || 1 })}
                                            disabled={!config.profile_requirements_enabled}
                                        />
                                    </PTextFieldWrapper>
                                    <PTextFieldWrapper label="Model Override (optional)" description="Use a specific model for this enricher. Leave blank to use the global model.">
                                        <input
                                            type="text"
                                            value={config.model_profile_requirements || ''}
                                            onChange={(e) => setConfig({ ...config, model_profile_requirements: e.target.value })}
                                            placeholder="e.g., gpt-4o-mini"
                                            disabled={!config.profile_requirements_enabled}
                                        />
                                    </PTextFieldWrapper>
                                    <PTextarea
                                        name="profileRequirementsPrompt"
                                        label="Prompt Template"
                                        value={config.prompt_profile_requirements}
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        onInput={(e: any) => {
                                            setConfig({ ...config, prompt_profile_requirements: e.target.value });
                                        }}
                                        rows={16}
                                        disabled={!config.profile_requirements_enabled}
                                    />
                                </div>
                            </PTabsItem>

                            <PTabsItem label="Reference Requirements">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '24px' }}>
                                    <PHeading size="small">Stage 6: Reference Requirements Enricher</PHeading>
                                    <PText>Extract required references and eligibility evidence from the tender.</PText>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <input
                                            type="checkbox"
                                            checked={config.reference_requirements_enabled}
                                            onChange={(e) => setConfig({ ...config, reference_requirements_enabled: e.target.checked })}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <PText weight="semi-bold">Enable Reference Requirements</PText>
                                    </div>
                                    <PTextFieldWrapper label="Max Items" description="Maximum number of reference requirements to return.">
                                        <input
                                            type="number"
                                            min="1"
                                            max="20"
                                            value={config.max_reference_requirements}
                                            onChange={(e) => setConfig({ ...config, max_reference_requirements: parseInt(e.target.value) || 1 })}
                                            disabled={!config.reference_requirements_enabled}
                                        />
                                    </PTextFieldWrapper>
                                    <PTextFieldWrapper label="Model Override (optional)" description="Use a specific model for this enricher. Leave blank to use the global model.">
                                        <input
                                            type="text"
                                            value={config.model_reference_requirements || ''}
                                            onChange={(e) => setConfig({ ...config, model_reference_requirements: e.target.value })}
                                            placeholder="e.g., gpt-4o-mini"
                                            disabled={!config.reference_requirements_enabled}
                                        />
                                    </PTextFieldWrapper>
                                    <PTextarea
                                        name="referenceRequirementsPrompt"
                                        label="Prompt Template"
                                        value={config.prompt_reference_requirements}
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        onInput={(e: any) => {
                                            setConfig({ ...config, prompt_reference_requirements: e.target.value });
                                        }}
                                        rows={16}
                                        disabled={!config.reference_requirements_enabled}
                                    />
                                </div>
                            </PTabsItem>

                            <PTabsItem label="Office Matching">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '24px' }}>
                                    <PHeading size="small">MHP Office Matching Prompt</PHeading>
                                    <PText>Define how the AI should select the nearest MHP office based on the tender data.</PText>


                                    {offices.length > 0 ? (
                                        <div style={{ padding: '16px', backgroundColor: '#e8f5e9', borderRadius: '4px', border: '1px solid #4caf50' }}>
                                            <PText weight="semi-bold" style={{ marginBottom: '8px' }}>✓ Active Offices ({offices.length}):</PText>
                                            <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px', whiteSpace: 'pre-wrap', maxHeight: '200px', overflow: 'auto' }}>
                                                {offices.map(o => {
                                                    const locParts = [o.city, o.state, o.country].filter(Boolean);
                                                    const locStr = locParts.length > 0 ? locParts.join(', ') : 'N/A';
                                                    const desc = o.description || '';
                                                    return `- ${o.name} (Ort: ${locStr}${desc ? ` | Details: ${desc}` : ''})`;
                                                }).join('\n')}
                                            </div>
                                            <PText size="x-small" style={{ marginTop: '8px', fontStyle: 'italic' }}>
                                                This list will be automatically injected into your prompt at the <code>{'{offices_list}'}</code> placeholder.
                                            </PText>
                                        </div>
                                    ) : (
                                        <PInlineNotification state="warning" heading="No Active Offices" description="Go to Distributing → Offices to create offices for matching." />
                                    )}


                                    <PTextarea
                                        name="officePrompt"
                                        label="Prompt Template"
                                        value={config.prompt_office_matching || ''}
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        onInput={(e: any) => {
                                            setConfig({ ...config, prompt_office_matching: e.target.value });
                                        }}
                                        rows={15}
                                    />
                                </div>
                            </PTabsItem>

                            <PTabsItem label="Chat Prompt">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '24px' }}>
                                    <PHeading size="small">Chat with Tender Prompt</PHeading>
                                    <PText>Define the system prompt for the "Chat with Tender" AI assistant. This controls the persona and behavioral rules.</PText>
                                    <PTextarea
                                        name="chatPrompt"
                                        label="Prompt Template"
                                        value={config.prompt_chat_with_tender || ''}
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        onInput={(e: any) => {
                                            setConfig({ ...config, prompt_chat_with_tender: e.target.value });
                                        }}
                                        rows={15}
                                    />
                                </div>
                            </PTabsItem>

                            <PTabsItem label="Label Matching">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '24px' }}>
                                    <PHeading size="small">Stage 7: Label Matching Prompt (Mandatory)</PHeading>
                                    <PText>Matches tenders against active taxonomy labels (Sectors/Services) based on semantic descriptions.</PText>

                                    <div style={{ padding: '16px', backgroundColor: '#e3f2fd', borderRadius: '4px', border: '1px solid #1976d2' }}>
                                        <PText weight="semi-bold" style={{ color: '#0d47a1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '1.2em' }}>ℹ️</span> Mandatory Matching Policy
                                        </PText>
                                        <PText size="small" style={{ marginTop: '8px' }}>
                                            Per feature <strong>feat-019</strong>, label matching is now <strong>mandatory</strong> for every enriched tender.
                                            The system will automatically inject your active labels and their semantic descriptions.
                                        </PText>
                                    </div>

                                    {labels.length > 0 ? (
                                        <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px', border: '1px solid #ccc' }}>
                                            <PText weight="semi-bold" style={{ marginBottom: '8px' }}>✓ Active Labels ({labels.length}):</PText>
                                            <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px', whiteSpace: 'pre-wrap', maxHeight: '200px', overflow: 'auto' }}>
                                                {labels.sort((a, b) => a.type.localeCompare(b.type)).map(l => (
                                                    `- [${l.type}] ${l.id} | ${l.name}: ${l.description || 'Keine Beschreibung'}`
                                                )).join('\n')}
                                            </div>
                                            <PText size="x-small" style={{ marginTop: '8px', fontStyle: 'italic' }}>
                                                This list is injected into the <code>{'{labels_list}'}</code> placeholder. AI matching prioritizes the <strong>description</strong> over the label name.
                                            </PText>
                                        </div>
                                    ) : (
                                        <PInlineNotification state="warning" heading="No Active Labels" description="Go to Taxonomy → Labels to create sectors or services for matching." />
                                    )}

                                    <PTextarea
                                        name="labelMatchingPrompt"
                                        label="Prompt Template"
                                        value={config.prompt_label_matching || ''}
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        onInput={(e: any) => {
                                            setConfig({ ...config, prompt_label_matching: e.target.value });
                                        }}
                                        rows={18}
                                    />
                                </div>
                            </PTabsItem>

                            <PTabsItem label="Distribution Matching">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '24px' }}>
                                    <PHeading size="small">Distribution Matching Prompt</PHeading>
                                    <PText>Define the logic for matching tenders to distribution lists.</PText>
                                    <PTextarea
                                        name="distributionMatchingPrompt"
                                        label="Prompt Template"
                                        value={config.prompt_distribution_matching || ''}
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        onInput={(e: any) => {
                                            setConfig({ ...config, prompt_distribution_matching: e.target.value });
                                        }}
                                        rows={20}
                                    />
                                </div>
                            </PTabsItem>
                        </PTabs>

                        <div style={{ marginTop: '32px' }}>
                            <PButton type="submit" loading={saving} disabled={saving}>Save Configuration</PButton>
                        </div>
                    </form>
                </StandardPageHeader>
            </div>

            {/* Prompt Template Library Modal */}
            <PromptTemplateLibrary
                isOpen={showTemplateLibrary}
                onClose={() => setShowTemplateLibrary(false)}
                onSelectTemplate={handleSelectTemplate}
            />

            <PModal
                open={isForceModalOpen}
                onDismiss={() => setIsForceModalOpen(false)}
                heading="Confirm Force Re-enrichment"
            >
                <PText>
                    This will re-enrich <strong>ALL</strong> tenders, even those already completed. This can consume many AI tokens and take significant time. Are you sure you want to continue?
                </PText>
                <PFlex style={{ gap: '16px', marginTop: '24px' }} justifyContent="end">
                    <PButton variant="secondary" onClick={() => setIsForceModalOpen(false)}>
                        Cancel
                    </PButton>
                    <PButton variant="primary" onClick={confirmForceBatch} loading={saving}>
                        Start Full Enrichment
                    </PButton>
                </PFlex>
            </PModal>
        </div>
    )
}

export default EnrichingConfigView
