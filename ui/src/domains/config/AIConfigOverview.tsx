import React, { useEffect, useState } from 'react';
import {PHeading,
    PText,
    PButton,
    PFlex,
    PInlineNotification,
    PTag,
    PDivider} from '@porsche-design-system/components-react';
import { StandardPageHeader } from '../../components/StandardPageHeader';
import { aiApi, type AIConnectorConfig } from '../ai/api';
import AIConfigView from '../ai/AIConfigView';

const AIConfigOverview: React.FC = () => {
    const [selectedProvider, setSelectedProvider] = useState<'openai' | 'gemini'>('openai');
    const [openaiConfig, setOpenaiConfig] = useState<AIConnectorConfig | null>(null);
    const [geminiConfig, setGeminiConfig] = useState<AIConnectorConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');

    useEffect(() => {
        loadConfigs();
    }, []);

    const loadConfigs = async () => {
        setLoading(true);
        try {
            const [openai, gemini] = await Promise.all([
                aiApi.getConfig('openai'),
                aiApi.getConfig('gemini')
            ]);
            setOpenaiConfig(openai);
            setGeminiConfig(gemini);

            // Set selected provider to the active one, or default to openai
            if (openai?.is_active) {
                setSelectedProvider('openai');
            } else if (gemini?.is_active) {
                setSelectedProvider('gemini');
            }
        } catch (error) {
            console.error('Failed to load AI configs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleActivate = async (provider: 'openai' | 'gemini') => {
        setSaving(true);
        setStatusMessage('');

        try {
            // Get the config to activate
            const configToActivate = provider === 'openai' ? openaiConfig : geminiConfig;
            const configToDeactivate = provider === 'openai' ? geminiConfig : openaiConfig;

            if (!configToActivate) {
                setStatusType('error');
                setStatusMessage(`Please configure ${provider === 'openai' ? 'OpenAI' : 'Google Gemini'} first`);
                setSaving(false);
                return;
            }

            // Update both configs
            await aiApi.saveConfig({
                provider: configToActivate.provider,
                is_active: true,
                model: configToActivate.model,
                api_version: configToActivate.api_version
            });

            if (configToDeactivate) {
                await aiApi.saveConfig({
                    provider: configToDeactivate.provider,
                    is_active: false,
                    model: configToDeactivate.model,
                    api_version: configToDeactivate.api_version
                });
            }

            // Reload configs
            await loadConfigs();

            setStatusType('success');
            setStatusMessage(`${provider === 'openai' ? 'OpenAI' : 'Google Gemini'} activated successfully`);
        } catch (error) {
            setStatusType('error');
            setStatusMessage('Failed to update AI configuration');
        } finally {
            setSaving(false);
        }
    };

    const getProviderButton = (
        title: string,
        provider: 'openai' | 'gemini',
        config: AIConnectorConfig | null
    ) => {
        const isSelected = selectedProvider === provider;
        const isActive = config?.is_active || false;

        return (
            <button
                onClick={() => setSelectedProvider(provider)}
                style={{
                    flex: 1,
                    padding: '20px',
                    border: isSelected ? '2px solid var(--tf-accent)' : '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? '#f0f9ff' : '#fff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    position: 'relative'
                }}
            >
                <PFlex direction="column" style={{ gap: '8px' }}>
                    <PFlex justifyContent="space-between" alignItems="center">
                        <PHeading size="medium">{title}</PHeading>
                        {isActive && (
                            <PTag color="notification-success">Active</PTag>
                        )}
                    </PFlex>
                    {config && config.model ? (
                        <PText size="small" style={{ color: '#666' }}>
                            Model: {config.model}
                        </PText>
                    ) : (
                        <PText size="small" style={{ color: '#999' }}>
                            Not configured
                        </PText>
                    )}
                </PFlex>
            </button>
        );
    };

    if (loading) {
        return (
            <div style={{ padding: '24px' }}>
                <PText>Loading AI configuration...</PText>
            </div>
        );
    }

    const currentConfig = selectedProvider === 'openai' ? openaiConfig : geminiConfig;

    // ...

    return (
        <div className="p-content-wrapper">
            <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <StandardPageHeader
                    title="AI Provider Configuration"
                    subtitle="Select and configure the AI provider for tender enrichment. Only one provider can be active at a time."
                />

                {statusMessage && (
                    <PInlineNotification
                        state={statusType}
                        heading={statusType === 'success' ? 'Success' : 'Error'}
                        description={statusMessage}
                        dismissButton={true}
                        onDismiss={() => setStatusMessage('')}
                    />
                )}

                {/* Provider Selection */}
                <div style={{ display: 'flex', gap: '16px' }}>
                    {getProviderButton('OpenAI / Azure OpenAI', 'openai', openaiConfig)}
                    {getProviderButton('Google Gemini', 'gemini', geminiConfig)}
                </div>

                {/* Set Default Button */}
                {currentConfig && !currentConfig.is_active && (
                    <div>
                        <PButton
                            variant="primary"
                            onClick={() => handleActivate(selectedProvider)}
                            loading={saving}
                            disabled={saving}
                        >
                            Set {selectedProvider === 'openai' ? 'OpenAI' : 'Google Gemini'} as Default
                        </PButton>
                    </div>
                )}

                <PDivider />

                {/* Detailed Configuration */}
                <div>
                    <AIConfigView key={selectedProvider} provider={selectedProvider} onSave={loadConfigs} />
                </div>
            </div>
        </div>
    );
};

export default AIConfigOverview;
