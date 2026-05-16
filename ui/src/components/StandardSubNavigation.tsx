import React from 'react';

export const StandardSubNavigation: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            position: 'sticky',
            top: '64px',
            zIndex: 900
        }}>
            <div style={{ padding: '0 40px', display: 'flex', gap: '24px' }}>
                {children}
            </div>
        </div>
    );
};

export const StandardSubNavigationItem: React.FC<{ as: any, to: string, label: string, active: boolean }> = ({ as: Component, to, label, active }) => {
    return (
        <Component
            to={to}
            style={{
                textDecoration: 'none',
                padding: '12px 0',
                fontSize: '12px',
                fontWeight: active ? '700' : '500',
                color: active ? 'var(--tf-accent)' : 'var(--tf-text-secondary)',
                borderBottom: active ? '2px solid var(--tf-accent)' : '2px solid transparent',
                transition: 'all 0.2s ease',
                display: 'inline-block'
            }}
        >
            {label}
        </Component>
    );
};
