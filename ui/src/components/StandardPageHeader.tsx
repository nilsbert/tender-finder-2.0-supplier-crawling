import React from 'react';
import {PHeading, PText} from '@porsche-design-system/components-react';

interface StandardPageHeaderProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
    children?: React.ReactNode;
}

export const StandardPageHeader: React.FC<StandardPageHeaderProps> = ({ title, subtitle, actions, children }) => {
    return (
        <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            marginBottom: '24px' // Standard spacing below header
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: children ? '24px' : '0'
            }}>
                <div>
                    <PHeading size="large">{title}</PHeading>
                    {subtitle && <PText size="small" color="contrast-medium">{subtitle}</PText>}
                </div>
                {actions && (
                    <div style={{ display: 'flex', gap: '16px' }}>
                        {actions}
                    </div>
                )}
            </div>
            {children}
        </div>
    );
};
