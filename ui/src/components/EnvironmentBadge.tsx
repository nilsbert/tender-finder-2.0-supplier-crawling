import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useReleaseNotes } from '../hooks/useReleaseNotes'
import { ReleaseNotesModal } from './ReleaseNotesModal'
import { useAuth } from '../domains/auth/AuthProvider'
import { api as ratingApi } from '../domains/rating/api'
import {PHeading,
    PTag,
    PText,
    PButton,
    PModal,
    PTextFieldWrapper,
    PDivider} from '@porsche-design-system/components-react'

interface EnvironmentInfo {
    mode: 'DEVELOPMENT' | 'TESTING' | 'STAGING' | 'PRODUCTION'
    message: string
    database?: string
    port?: number
}

export const EnvironmentBadge = () => {
    const { t } = useTranslation()
    const { identity, toggleRole, login, logout, updateProfile } = useAuth()
    const [envInfo, setEnvInfo] = useState<EnvironmentInfo | null>(null)
    const [dbMode, setDbMode] = useState<'disconnected' | 'cosmos' | 'test' | 'mssql'>('disconnected')
    const [dbError, setDbError] = useState<string | null>(null)
    const [showDbErrorModal, setShowDbErrorModal] = useState(false)

    const { versions, loading, error, hasNewUpdate, markAsRead } = useReleaseNotes()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [showIdentityPopover, setShowIdentityPopover] = useState(false)

    // Local Profile Mask State
    const [maskFirstName, setMaskFirstName] = useState(identity?.firstName || '')
    const [maskLastName, setMaskLastName] = useState(identity?.lastName || '')
    const [maskEmail, setMaskEmail] = useState(identity?.email || '')

    useEffect(() => {
        if (identity) {
            setMaskFirstName(identity.firstName || '')
            setMaskLastName(identity.lastName || '')
            setMaskEmail(identity.email || '')
        }
    }, [identity])


    const checkDbStatus = async () => {
        try {
            const status = await ratingApi.getConfigStatus();
            setDbMode(status.mode as 'disconnected' | 'cosmos' | 'test' | 'mssql');
            // @ts-ignore
            if (status.error) setDbError(status.error);
        } catch (e) {
            console.error("Failed to check db status", e);
        }
    };

    useEffect(() => {
        checkDbStatus();

        // Check backend root endpoint for environment info
        fetch('/api/')
            .then(res => res.json())
            .then(data => {
                // Backend standardized modes: DEVELOPMENT, TESTING, STAGING, PRODUCTION
                const mode = data.mode as EnvironmentInfo['mode'];

                if (mode === 'TESTING') {
                    setEnvInfo({
                        mode: 'TESTING',
                        message: data.message || t('common.environment.test'),
                        database: data.database,
                        port: data.port
                    })
                } else if (mode === 'DEVELOPMENT' || mode === 'LOCAL' as any) {
                    setEnvInfo({
                        mode: 'DEVELOPMENT',
                        message: t('common.environment.local')
                    })
                } else if (mode === 'STAGING') {
                    setEnvInfo({
                        mode: 'STAGING',
                        message: t('common.environment.staging')
                    })
                } else {
                    // Default to PRODUCTION if mode is unknown or explicitly PRODUCTION
                    setEnvInfo({
                        mode: 'PRODUCTION',
                        message: t('common.environment.production')
                    })
                }
            })
            .catch(() => {
                // Default to production if can't detect
                setEnvInfo({
                    mode: 'PRODUCTION',
                    message: t('common.environment.production')
                })
            })
    }, [t])

    if (!envInfo) return null

    const getColor = () => {
        switch (envInfo.mode) {
            case 'DEVELOPMENT':
                return {
                    bg: '#007BFF', // Blue for local dev
                    text: '#FFFFFF',
                    border: '#0056b3'
                }
            case 'TESTING':
                return {
                    bg: '#28A745', // Green for testing (safe)
                    text: '#FFFFFF',
                    border: '#218838'
                }
            case 'STAGING':
                return {
                    bg: '#FFA500', // Orange for staging (warning)
                    text: '#000000',
                    border: '#FF8C00'
                }
            case 'PRODUCTION':
                return {
                    bg: '#DC3545', // Red for production (CAUTION)
                    text: '#FFFFFF',
                    border: '#C82333'
                }
        }
    }

    const colors = getColor()
    const title = envInfo.database
        ? `${envInfo.mode} ${t('common.environment.mode')}\n${t('common.environment.database')}: ${envInfo.database}${envInfo.port ? `\n${t('common.environment.port')}: ${envInfo.port}` : ''}`
        : `${envInfo.mode} ${t('common.environment.mode')}`

    const handleOpenModal = () => {
        setIsModalOpen(true)
        markAsRead()
    }

    // Helper for DB Badge Color
    const getDbBadgeColor = () => {
        if (dbMode === 'cosmos' || dbMode === 'mssql') return { bg: '#28a745', text: '#fff' }; // Success Green
        if (dbMode === 'test') return { bg: '#ffc107', text: '#000' }; // Warning Yellow
        return { bg: '#dc3545', text: '#fff' }; // Error Red
    };

    const dbBadgeColors = getDbBadgeColor();

    return (
        <>
            <div
                style={{
                    position: 'fixed',
                    top: '16px',
                    right: '16px',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '8px'
                }}
            >
                {/* Environment Badge */}
                <div
                    style={{
                        backgroundColor: colors.bg,
                        color: colors.text,
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: `2px solid ${colors.border}`,
                        fontWeight: 'bold',
                        fontSize: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        cursor: 'help',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '240px',
                        justifyContent: 'flex-start'
                    }}
                    title={title}
                >
                    <span
                        style={{
                            display: 'inline-block',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: colors.text,
                            animation: 'pulse 2s infinite',
                            flexShrink: 0
                        }}
                    />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{
                        envInfo.mode === 'DEVELOPMENT' ? t('common.environment.local') :
                            envInfo.mode === 'TESTING' ? t('common.environment.test') :
                                envInfo.mode === 'STAGING' ? t('common.environment.staging') :
                                    t('common.environment.production')
                    }</span>
                </div>

                {/* DB Connection Badge */}
                <button
                    type="button"
                    onClick={() => dbMode === 'disconnected' && setShowDbErrorModal(true)}
                    style={{
                        backgroundColor: '#fff',
                        color: '#000',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: '1px solid #e0e0e0',
                        fontWeight: '600',
                        fontSize: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        cursor: dbMode === 'disconnected' ? 'pointer' : 'default',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        width: '240px',
                        justifyContent: 'flex-start'
                    }}
                >
                    <span
                        style={{
                            display: 'inline-block',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: dbBadgeColors.bg,
                            flexShrink: 0
                        }}
                    />
                    <span>
                        {dbMode === 'cosmos' && 'Cosmos DB'}
                        {dbMode === 'mssql' && 'MSSQL'}
                        {dbMode === 'test' && 'In-Memory DB'}
                        {dbMode === 'disconnected' && 'No DB Connection'}
                    </span>
                </button>

                {/* Release Notes Trigger */}
                <button
                    type="button"
                    onClick={handleOpenModal}
                    style={{
                        backgroundColor: '#fff',
                        color: '#000',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: '1px solid #e0e0e0',
                        fontWeight: '600',
                        fontSize: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        position: 'relative',
                        width: '240px',
                        justifyContent: 'flex-start'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                >
                    {hasNewUpdate && (
                        <span
                            style={{
                                position: 'absolute',
                                top: '-2px',
                                right: '-2px',
                                width: '10px',
                                height: '10px',
                                backgroundColor: '#DC3545',
                                borderRadius: '50%',
                                border: '2px solid #fff'
                            }}
                        />
                    )}
                    <span>Release Notes</span>
                </button>

                {/* Role / Identity Button Trigger */}
                {identity ? (
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowIdentityPopover(!showIdentityPopover)}
                            style={{
                                backgroundColor: '#fff',
                                color: '#000',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border: '1px solid #e0e0e0',
                                fontWeight: '600',
                                fontSize: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                width: '240px',
                                justifyContent: 'flex-start'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)'
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                        >
                            Role: {identity.isAdmin ? 'Admin' : 'User'}
                        </button>

                        {showIdentityPopover && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: '8px',
                                width: '280px',
                                backgroundColor: 'white',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                                borderRadius: '12px',
                                border: '1px solid #e0e0e0',
                                padding: '20px',
                                zIndex: 10000
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: '50%',
                                                backgroundColor: 'var(--tf-accent, #000)',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '18px',
                                                fontWeight: 'bold'
                                            }}>
                                                {(identity.name || identity.email).charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <PHeading size="small">{identity.name || 'User'}</PHeading>
                                                <PText size="x-small" color="contrast-medium">{identity.email}</PText>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <PTag color={identity.isAdmin ? "notification-success" : "notification-info-soft"}>
                                            {identity.isAdmin ? 'Administrator' : 'Standard User'}
                                        </PTag>
                                    </div>

                                    {/* Role Toggle Switch (Non-Prod) */}
                                    {toggleRole && (
                                        <div style={{ marginTop: '4px' }}>
                                            <PButton
                                                variant="tertiary"
                                                icon="switch"
                                                onClick={() => {
                                                    if (toggleRole) toggleRole();
                                                    setShowIdentityPopover(false);
                                                }}
                                                style={{ width: '100%', justifyContent: 'flex-start' }}
                                            >
                                                Switch to {identity.isAdmin ? 'User' : 'Admin'} Role
                                            </PButton>
                                        </div>
                                    )}

                                    <PDivider />

                                    {(identity.oid || identity.tenantId || (import.meta.env.VITE_AUTH_PROVIDER === 'msal')) && (
                                        <div style={{
                                            marginTop: '4px',
                                            padding: '10px',
                                            backgroundColor: '#f9fafb',
                                            borderRadius: '8px',
                                            border: '1px solid #f3f4f6'
                                        }}>
                                            <PText size="xx-small" weight="semi-bold" color="contrast-medium" style={{ marginBottom: '6px', display: 'block' }}>
                                                IAM DETAILS (ENFORCED)
                                            </PText>
                                            {identity.oid && (
                                                <PText size="xx-small" color="contrast-low">OID: {identity.oid}</PText>
                                            )}
                                            {identity.tenantId && (
                                                <PText size="xx-small" color="contrast-low" style={{ marginTop: '2px' }}>
                                                    TID: {identity.tenantId}
                                                </PText>
                                            )}
                                            {import.meta.env.VITE_AUTH_PROVIDER === 'msal' && !identity.oid && (
                                                 <PText size="xx-small" color="notification-warning">Awaiting MSAL Handshake...</PText>
                                            )}
                                        </div>
                                    )}

                                    <PDivider />

                                    <div>
                                        <PButton
                                            variant="secondary"
                                            icon="logout"
                                            onClick={() => logout && logout()}
                                            style={{ width: '100%' }}
                                        >
                                            Logout
                                        </PButton>
                                    </div>

                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                            onClick={() => {
                                localStorage.setItem('userProfileMask', JSON.stringify({
                                    email: 'nilshyoma@gmail.com',
                                    isAdmin: true
                                }));
                                window.location.reload();
                            }}
                            style={{
                                backgroundColor: '#f0f0f0',
                                color: '#000',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border: '1px solid #ccc',
                                fontWeight: '600',
                                fontSize: '10px',
                                cursor: 'pointer',
                                width: '240px',
                                textAlign: 'left',
                                opacity: 0.8
                            }}
                        >
                            ⚡ Switch to Admin (Bypass)
                        </button>
                        <button
                            onClick={() => login && login()}
                            style={{
                                backgroundColor: '#fff',
                                color: '#000',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border: '1px solid #e0e0e0',
                                fontWeight: '600',
                                fontSize: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                width: '240px',
                                justifyContent: 'flex-start'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)'
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                        >
                            Login
                        </button>
                    </div>
                )}
            </div>

            <ReleaseNotesModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                notes={versions}
                loading={loading}
                error={error}
            />

            {/* DB Error Modal */}
            <PModal
                open={showDbErrorModal}
                onDismiss={() => setShowDbErrorModal(false)}
            >
                <PHeading size="large" slot="header">Database Connection Error</PHeading>
                <PText>The application could not connect to the database. Below is the technical error message:</PText>
                <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    color: '#c00'
                }}>
                    {dbError || "Unknown error occurred."}
                </div>
                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                    <PButton type="button" variant="primary" onClick={() => setShowDbErrorModal(false)}>Close</PButton>
                </div>
            </PModal>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </>
    )
}
