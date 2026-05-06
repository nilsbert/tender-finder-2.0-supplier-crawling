import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {PHeading,
    PFlex,
    PFlexItem,
    PText} from '@porsche-design-system/components-react';

import { useAuth } from '../domains/auth/AuthProvider';

type ActiveItem = 'dashboard' | 'sourcing' | 'qualification' | 'taxonomy' | 'governance' | 'distributing' | 'iam' | 'settings';

interface ProcessHeaderProps {
    activeItem?: ActiveItem;
    showSourcingAutomation?: boolean;
}

const navItems = (t: (key: string) => string): Array<{
    key: ActiveItem;
    label: string;
    path: string;
    enabled?: boolean;
    requiresAdmin?: boolean;
}> => [
        { key: 'sourcing', label: t('header.nav.sourcing'), path: '/sourcing/config/run', requiresAdmin: true },
    ];

const disabledItems: Array<{ label: string }> = [];

const pillButtonStyle = {
    backgroundColor: '#fff',
    color: '#000',
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid #e0e0e0',
    fontWeight: '600' as const,
    fontSize: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    textDecoration: 'none'
};

const navButtonStyle = {
    padding: '12px 0',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block'
};

const languages = [
    { code: 'en', label: 'EN' },
    { code: 'de', label: 'DE' },
    { code: 'jp', label: 'JP' },
];

export const ProcessHeader: FC<ProcessHeaderProps> = ({
    activeItem,
}) => {
    const { t, i18n } = useTranslation();
    const { identity } = useAuth();

    // Filter items based on both enabled flag and admin requirements
    const items = navItems(t).filter((item) => {
        if (item.enabled === false) return false;
        if (item.requiresAdmin && !identity?.isAdmin) return false;
        
        // Ensure standalone build only shows its own nav item
        const standalone = import.meta.env.VITE_STANDALONE_DOMAIN;
        if (standalone && item.key !== standalone) return false;
        
        return true;
    });

    const visibleDisabledItems = disabledItems.filter(Boolean) as Array<{ label: string }>;

    return (
        <header style={{
            backgroundColor: 'white',
            borderBottom: '1px solid #e0e0e0',
            position: 'sticky',
            top: 0,
            zIndex: 10
        }}>
            <div className="p-content-wrapper">
                <div style={{
                    height: '64px',
                    padding: '0 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap'
                }}>
                    <PFlex>
                        <PFlexItem>
                            <PHeading size="large" tag="h1">{t('header.app_title')}</PHeading>
                        </PFlexItem>
                    </PFlex>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Language Selection Pills */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {languages.map((lng) => {
                                const isActive = i18n.language === lng.code;
                                return (
                                    <button
                                        key={lng.code}
                                        onClick={() => i18n.changeLanguage(lng.code)}
                                        style={{
                                            ...pillButtonStyle,
                                            padding: '6px 12px',
                                            backgroundColor: isActive ? 'var(--tf-accent, #000)' : '#fff',
                                            color: isActive ? '#fff' : '#000',
                                            borderColor: isActive ? 'var(--tf-accent, #000)' : '#e0e0e0',
                                            boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
                                            fontWeight: isActive ? 'bold' : '600'
                                        }}
                                    >
                                        {lng.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{
                borderBottom: '1px solid #e0e0e0',
                backgroundColor: 'white'
            }}>
                <div className="p-content-wrapper">
                    <div style={{
                        display: 'flex',
                        padding: '0 24px',
                        gap: '24px',
                        alignItems: 'center',
                        flexWrap: 'wrap'
                    }}>
                        {items.map((item) => {
                            const isActive = item.key === activeItem;
                            const isExternal = item.path.startsWith('http');
                            
                            const linkStyle = {
                                ...navButtonStyle,
                                borderBottom: isActive ? '2px solid var(--tf-accent)' : '2px solid transparent',
                                color: isActive ? 'var(--tf-accent)' : '#666'
                            };

                            if (isExternal) {
                                return (
                                    <a
                                        key={item.key}
                                        href={item.path}
                                        style={linkStyle}
                                    >
                                        <PText size="small" weight="semi-bold" color="inherit">
                                            {item.label}
                                        </PText>
                                    </a>
                                );
                            }

                            return (
                                <Link
                                    key={item.key}
                                    to={item.path}
                                    style={linkStyle}
                                >
                                    <PText size="small" weight="semi-bold" color="inherit">
                                        {item.label}
                                    </PText>
                                </Link>
                            );
                        })}
                        {visibleDisabledItems.map((item) => (
                            <button
                                key={item.label}
                                disabled
                                style={{
                                    ...navButtonStyle,
                                    cursor: 'not-allowed',
                                    color: '#bbb',
                                    opacity: 0.5
                                }}
                            >
                                <PText size="small" weight="semi-bold" color="contrast-low">{item.label}</PText>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </header>
    );
};
