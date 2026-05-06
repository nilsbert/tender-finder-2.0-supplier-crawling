import { useEffect, useState, useRef } from 'react';
import {PHeading, PText, PButton, PTag, PInlineNotification, PSpinner} from '@porsche-design-system/components-react';
import { startupService } from './startupService';
import type { StartupStatus, StartupStep } from './types';

// Helper to calculate duration for display (optional, can be expanded)


export default function StartupView() {
    const [status, setStatus] = useState<StartupStatus | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [lastAttempt, setLastAttempt] = useState<number>(Date.now());
    const [history, setHistory] = useState<string[]>(['Initializing Startup View...']);

    // Track if we are currently fetching to avoid race conditions
    const isFetching = useRef(false);

    const addLog = (msg: string) => {
        const time = new Date().toLocaleTimeString();
        setHistory(prev => [`[${time}] ${msg}`, ...prev].slice(0, 50));
    };

    const fetchStatus = async () => {
        if (isFetching.current) return;
        isFetching.current = true;

        try {
            const data = await startupService.getStartupStatus();
            setStatus(data);
            setError(null);
            if (data.is_ready) {
                addLog('System reported READY.');
            }
        } catch (e: any) {
            console.error(e);
            // Construct a helpful error message
            let msg = 'Failed to connect to backend service.';
            if (e.message) msg += ` (${e.message})`;
            if (e.code === 'ERR_NETWORK') msg = 'Backend is unreachable (Connection Refused). Is the server running?';

            setError(msg);
            addLog(`Error: ${msg}`);
            setRetryCount(c => c + 1);
        } finally {
            setLastAttempt(Date.now());
            isFetching.current = false;
        }
    };

    useEffect(() => {
        // Initial fetch
        addLog('Attempting to contact backend system...');
        fetchStatus();

        // Poll every 250ms for instant feedback during startup
        const interval = setInterval(() => {
            fetchStatus();
        }, 250);

        return () => clearInterval(interval);
    }, []);

    const handleRetry = async () => {
        addLog('User requested manual retry...');
        setError(null);
        setRetryCount(0);
        try {
            await startupService.retryStartup();
            addLog('Sent retry command to backend.');
            // Immediate status check
            setTimeout(fetchStatus, 500);
        } catch (e: any) {
            addLog(`Retry command failed: ${e.message}`);
        }
    };

    // Calculate progress
    const steps = status?.steps || [];
    const completedSteps = steps.filter(s => s.status === 'completed').length;
    const totalSteps = steps.length || 1; // avoid divide by zero
    const progress = Math.round((completedSteps / totalSteps) * 100);

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0e0e0e',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '2rem',
            fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{ maxWidth: '800px', width: '100%' }}>
                <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
                    <PHeading size="large" style={{ color: '#fff' }}>System Boot Sequence</PHeading>
                    <PText style={{ color: '#888', marginTop: '0.5rem' }}>
                        Tender Finder v2.0 Initialization
                    </PText>
                </header>

                {/* Connection Error State */}
                {error && (
                    <div style={{ marginBottom: '2rem' }}>
                        <PInlineNotification
                            state="error"
                            heading="Backend Connection Failed"
                            description={`${error} Retrying automatically... (Attempt ${retryCount})`}
                        />
                    </div>
                )}

                {/* Main Status Display */}
                <div style={{
                    background: '#1a1a1a',
                    borderRadius: '8px',
                    padding: '2rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                    border: '1px solid #333'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <PText weight="semi-bold" size="medium" style={{ color: '#fff' }}>Startup Progress</PText>
                            <PText size="small" style={{ color: '#888' }}>
                                {status ? `${progress}% Complete` : 'Waiting for signal...'}
                            </PText>
                        </div>
                        {status ? <PSpinner /> : <span style={{ width: 24, height: 24, borderRadius: '50%', background: error ? '#ff3333' : '#333' }} />}
                    </div>

                    <div style={{ marginBottom: '1rem', textAlign: 'right', marginTop: '-1.5rem' }}>
                        <PText size="x-small" style={{ color: '#555' }}>
                            Last check: {new Date(lastAttempt).toLocaleTimeString()}
                        </PText>
                    </div>

                    {/* Pending/Active/Completed Steps */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {/* If we have no status but also no error yet, show skeleton or loading msg */}
                        {!status && !error && (
                            <PText style={{ color: '#666', fontStyle: 'italic' }}>Waiting for system response...</PText>
                        )}

                        {steps.map((step: StartupStep) => (
                            <div key={step.name} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1rem',
                                background: step.status === 'in_progress' ? 'var(--tf-accent-bg)' : '#222',
                                borderLeft: step.status === 'in_progress' ? '3px solid var(--tf-accent)' : step.status === 'completed' ? '3px solid var(--tf-accent-2)' : '3px solid transparent',
                                borderRadius: '4px',
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <PText style={{ color: step.status === 'completed' ? '#fff' : '#ccc' }}>
                                            {step.name}
                                        </PText>
                                        {step.status === 'in_progress' && <PSpinner size="inherit" />}
                                    </div>
                                    {step.message && (
                                        <PText size="small" style={{ color: step.status === 'failed' ? '#ff3333' : '#888', marginTop: '0.25rem' }}>
                                            {step.message}
                                        </PText>
                                    )}
                                </div>
                                <PTag color={
                                    step.status === 'completed' ? 'notification-success' :
                                        step.status === 'failed' ? 'notification-error' :
                                            step.status === 'in_progress' ? 'notification-info-soft' : 'background-surface'
                                }>
                                    {step.status.toUpperCase()}
                                </PTag>
                            </div>
                        ))}
                    </div>

                    {/* Retry Action */}
                    {(error || steps.some(s => s.status === 'failed')) && (
                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                            <PButton variant="primary" onClick={handleRetry}>
                                Force Retry Sequence
                            </PButton>
                        </div>
                    )}
                </div>

                {/* Terminal / Activity Log */}
                <div style={{ marginTop: '2rem' }}>
                    <PText weight="semi-bold" style={{ color: '#666', marginBottom: '0.5rem' }}>Live Activity Log</PText>
                    <div style={{
                        background: '#000',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        padding: '1rem',
                        borderRadius: '6px',
                        height: '200px',
                        overflowY: 'auto',
                        border: '1px solid #333',
                        color: '#0f0'
                    }}>
                        {history.map((log, i) => (
                            <div key={i} style={{ opacity: Math.max(0.3, 1 - i * 0.1) }}>
                                {log}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
