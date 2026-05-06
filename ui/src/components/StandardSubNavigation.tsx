import React from 'react';


interface StandardSubNavigationProps {
    children: React.ReactNode;
}

export const StandardSubNavigation: React.FC<StandardSubNavigationProps> = ({ children }) => {
    return (
        <div style={{
            backgroundColor: '#fafafa',
            borderBottom: '1px solid #e0e0e0'
        }}>
            <div className="p-content-wrapper">
                <div style={{
                    padding: '0 24px',
                    display: 'flex',
                    gap: '24px'
                }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

interface StandardSubNavigationItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
    active: boolean;
    as?: React.ElementType;
    to?: string; // For router links
    [key: string]: any;
}

export const StandardSubNavigationItem: React.FC<StandardSubNavigationItemProps> = ({
    label,
    active,
    as,
    style,
    ...props
}) => {
    const baseStyle = {
        padding: '16px 0',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        color: active ? 'var(--tf-accent)' : '#666',
        borderBottom: active ? '2px solid var(--tf-accent)' : '2px solid transparent',
        fontWeight: active ? 'bold' : 'normal',
        fontSize: '14px',
        transition: 'all 0.2s',
        display: 'inline-block',
        textDecoration: 'none', // Important if rendered as a link
        ...style // Allow manual overrides
    };

    const Component = as || 'button';

    return (
        <Component style={baseStyle} {...props}>
            {label}
        </Component>
    );
};
