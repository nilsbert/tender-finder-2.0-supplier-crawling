import React, { useState, useEffect } from 'react';
import {PButton,
    PHeading,
    PText,
    PSelectWrapper,
    PInlineNotification,
    PFlex,
    PDivider} from '@porsche-design-system/components-react';
import { aiApi, type AIConnectorConfig } from './api';

interface AIConfigViewProps {
    provider: 'openai' | 'gemini';
    onSave?: () => void;
}

const AIConfigView: React.FC<AIConfigViewProps> = ({ provider, onSave }) => {
    const [config, setConfig] = useState<AIConnectorConfig>({
        provider: provider,
        is_active: false,
        model: provider === 'openai' ? 'gpt-4o' : 'gemini-2.5-flash',
        api_version: '',
        has_credentials: false,
        credential_source: undefined,
        available_models: []
    });
    const [loading, setLoading] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isFetchingModels, setIsFetchingModels] = useState(false);
    const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        loadConfig(provider);
    }, [provider]);

    const loadConfig = async (currentProvider: 'openai' | 'gemini') => {
        setLoading(true);
        try {
            const data = await aiApi.getConfig(currentProvider);
            if (data) {
                setConfig(data);
            } else {
                // Reset to defaults if no config exists
                setConfig({
                    provider: currentProvider,
                    is_active: false,
                    model: currentProvider === 'openai' ? 'gpt-4o' : 'gemini-2.5-flash',
                    api_version: '',
                    has_credentials: false,
                    credential_source: undefined,
                    available_models: []
                });
            }
            setTestStatus('idle');
        } catch (error) {
            console.error("Failed to load config", error);
            // Fallback to default config on error to prevent broken UI
            setConfig({
                provider: currentProvider,
                is_active: false,
                model: currentProvider === 'openai' ? 'gpt-4o' : 'gemini-2.5-flash',
                api_version: '',
                has_credentials: false,
                credential_source: undefined,
                available_models: []
            });
        } finally {
            setLoading(false);
        }
    };
    const handleInputChange = (field: keyof AIConnectorConfig, value: string | boolean) => {
        setConfig(prev => ({ ...prev, [field]: value }));
        setTestStatus('idle');
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        try {
            const response = await aiApi.testConnection(provider);
            if (response.success) {
                setTestStatus('success');
                setStatusMessage(response.message);
            } else {
                setTestStatus('error');
                setStatusMessage(response.message || 'Connection failed');
            }
        } catch (error: any) {
            setTestStatus('error');
            setStatusMessage(error.response?.data?.detail || 'Connection failed');
        } finally {
            setIsTesting(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await aiApi.saveConfig({
                provider: config.provider,
                is_active: config.is_active,
                model: config.model,
                api_version: config.api_version
            });
            setTestStatus('success');
            setStatusMessage('Configuration saved successfully.');
            if (onSave) onSave();
        } catch {
            setTestStatus('error');
            setStatusMessage('Failed to save configuration');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRefreshModels = async () => {
        if (!config.has_credentials) {
            setTestStatus('error');
            setStatusMessage('Missing credentials in backend environment variables');
            return;
        }

        setIsFetchingModels(true);
        setTestStatus('idle');
        try {
            const models = await aiApi.fetchModels(provider);
            setConfig(prev => ({ ...prev, available_models: models }));
            setTestStatus('success');
            setStatusMessage(`Found ${models.length} available models`);
        } catch (error: any) {
            setTestStatus('error');
            setStatusMessage(error.response?.data?.detail || 'Failed to fetch models');
        } finally {
            setIsFetchingModels(false);
        }
    };

    return (
        <>
            {loading ? (
                <div style={{ padding: '32px', textAlign: 'center' }}>
                    <PText>Loading configuration...</PText>
                </div>
            ) : (
                <div style={{
                    marginTop: '24px',
                    backgroundColor: 'white',
                    padding: '32px',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    maxWidth: '800px'
                }}>
                    <PFlex alignItems="center" justifyContent="space-between" style={{ marginBottom: '24px' }}>
                        <PHeading size="medium">{provider === 'openai' ? 'OpenAI Configuration' : 'Google Gemini Configuration'}</PHeading>
                    </PFlex>

                    <PDivider style={{ marginBottom: '24px' }} />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ padding: '12px 16px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
                            <PText>
                                Credentials are loaded from backend environment variables (not stored in the database).
                            </PText>
                            <PText size="small" style={{ color: '#666', marginTop: '4px' }}>
                                Status: {config.has_credentials ? 'configured' : 'missing'}{config.credential_source ? ` (${config.credential_source})` : ''}
                            </PText>
                            {!config.has_credentials && (
                                <PText size="small" style={{ color: '#666', marginTop: '4px' }}>
                                    Set {provider === 'openai' ? '`OPENAI_API_KEY` or `AZURE_OPENAI_API_KEY` + `AZURE_OPENAI_ENDPOINT`' : '`GEMINI_API_KEY`'} in your `.env` and restart the backend.
                                </PText>
                            )}
                        </div>

                        <div style={{ marginTop: '-12px' }}>
                            <PButton
                                variant="tertiary"
                                onClick={handleRefreshModels}
                                loading={isFetchingModels}
                                disabled={!config.has_credentials || isFetchingModels}
                                icon="refresh"
                            >
                                Refresh Models
                            </PButton>
                        </div>


                        <PSelectWrapper label="Model" description="Select the model to use for analysis.">
                            <select value={config.model} onChange={(e) => handleInputChange('model', e.target.value)}>
                                {config.available_models && config.available_models.length > 0 ? (
                                    // Use dynamically fetched models
                                    <>
                                        {config.available_models.map((model: any) => {
                                            const modelName = typeof model === 'string' ? model : model.name;
                                            const displayName = typeof model === 'string' ? model : (model.displayName || model.name);
                                            return (
                                                <option key={modelName} value={modelName}>
                                                    {displayName}
                                                </option>
                                            );
                                        })}
                                    </>
                                ) : provider === 'openai' ? (
                                    // Fallback: Hardcoded OpenAI models
                                    <>
                                        <option value="gpt-4o">GPT-4o (Multimodal, Fast)</option>
                                        <option value="gpt-4o-mini">GPT-4o Mini (Cost Efficient)</option>
                                        <option value="o1-preview">o1-preview (Advanced Reasoning)</option>
                                        <option value="o1-mini">o1-mini (Fast Reasoning)</option>
                                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                        <option value="gpt-4">GPT-4 (Classic)</option>
                                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                    </>
                                ) : (
                                    // Fallback: Hardcoded Gemini models
                                    <>
                                        <option value="gemini-3-pro-preview">Gemini 3 Pro (Preview)</option>
                                        <option value="gemini-3-flash-preview">Gemini 3 Flash (Preview)</option>
                                        <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                                        <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                        <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash-Lite</option>
                                        <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                                        <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Experimental)</option>
                                        <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                                        <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                                        <option value="gemini-pro-latest">Gemini Pro (Latest Stable)</option>
                                        <option value="gemini-flash-latest">Gemini Flash (Latest Stable)</option>
                                    </>
                                )}
                            </select>
                        </PSelectWrapper>

                        {testStatus !== 'idle' && (
                            <PInlineNotification
                                state={testStatus === 'error' ? 'error' : 'success'}
                                heading={testStatus === 'error' ? 'Error' : 'Success'}
                                description={statusMessage}
                            />
                        )}

                        <PFlex style={{ gap: '16px', marginTop: '16px' }}>
                            <PButton
                                variant="secondary"
                                onClick={handleTestConnection}
                                loading={isTesting}
                                disabled={!config.has_credentials || isSaving}
                            >
                                Test Connection
                            </PButton>
                            <PButton
                                variant="primary"
                                onClick={handleSave}
                                loading={isSaving}
                                disabled={isTesting || isSaving}
                            >
                                Save Configuration
                            </PButton>
                        </PFlex>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIConfigView;
