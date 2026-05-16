// @ts-nocheck
import React from 'react';
// Export everything from the real package bypassing exports map
// @ts-ignore
export * from '../node_modules/@porsche-design-system/components-react/esm/public-api.mjs';

// Import needed components from the real package for the wrappers
// @ts-ignore
import { 
  PInputText, 
  PSelect as PDSSelect, 
  PSelectOption, 
  PCheckbox as PDSCheckbox, 
  PTextarea as PDSTextarea 
} from '../node_modules/@porsche-design-system/components-react/esm/public-api.mjs';

// Polyfill removed components
export const PContentWrapper = ({ children, style }: any) => {
  return <div className="p-content-wrapper" style={style}>{children}</div>;
};

export const PFlex = ({ children, direction, gap, alignItems, justifyContent, style }: any) => {
  const flexStyle = {
    display: 'flex',
    flexDirection: direction || 'row',
    gap: gap || '0px',
    alignItems: alignItems || 'stretch',
    justifyContent: justifyContent || 'flex-start',
    ...style
  };
  return <div style={flexStyle}>{children}</div>;
};

export const PFlexItem = ({ children, grow, shrink, style }: any) => {
  const itemStyle = {
    flexGrow: grow || 0,
    flexShrink: shrink || 1,
    ...style
  };
  return <div style={itemStyle}>{children}</div>;
};

export const PGrid = ({ children, style }: any) => {
  return <div style={{ display: 'grid', ...style }}>{children}</div>;
};

export const PGridItem = ({ children, style }: any) => {
  return <div style={style}>{children}</div>;
};

export const PTextFieldWrapper = ({ label, children, hideLabel, description }: any) => {
  if (!children) return null;
  const child = React.Children.only(children) as React.ReactElement;
  const props = child.props as any;
  const { value, onChange, placeholder, disabled, name, type } = props;
  
  return (
    <PInputText
      label={hideLabel ? '' : label}
      value={value}
      onInput={(e: any) => onChange && onChange({ target: { value: e.target.value, name } })}
      placeholder={placeholder}
      disabled={disabled}
      name={name}
      type={type || 'text'}
      description={description}
    />
  );
};

export const PSelectWrapper = ({ label, children, hideLabel, description }: any) => {
  if (!children) return null;
  const child = React.Children.only(children) as React.ReactElement;
  const props = child.props as any;
  const { value, onChange, name } = props;
  const options = React.Children.toArray(props.children);

  return (
    <PDSSelect
      label={hideLabel ? '' : label}
      value={value}
      onChange={(e: any) => onChange && onChange({ target: { value: e.target.value, name } })}
      name={name}
      description={description}
    >
      {options.map((opt: any, idx) => {
        if (!opt || !opt.props) return null;
        return (
          <PSelectOption key={idx} value={opt.props.value}>
            {opt.props.children}
          </PSelectOption>
        );
      })}
    </PDSSelect>
  );
};

export const PCheckboxWrapper = ({ label, children, hideLabel }: any) => {
  if (!children) return null;
  const child = React.Children.only(children) as React.ReactElement;
  const props = child.props as any;
  const { checked, onChange, name } = props;

  return (
    <PDSCheckbox
      label={hideLabel ? '' : label}
      checked={checked}
      onChange={(e: any) => onChange && onChange({ target: { checked: e.target.checked, name } })}
      name={name}
    />
  );
};

export const PTextareaWrapper = ({ label, children, description }: any) => {
  if (!children) return null;
  const child = React.Children.only(children) as React.ReactElement;
  const props = child.props as any;
  const { value, onChange, placeholder, disabled, name } = props;

  return (
    <PDSTextarea
      label={label}
      value={value}
      onInput={(e: any) => onChange && onChange({ target: { value: e.target.value, name } })}
      placeholder={placeholder}
      disabled={disabled}
      name={name}
      description={description}
    />
  );
};
// @ts-ignore
export { PHeading as PHeadline } from "../node_modules/@porsche-design-system/components-react/esm/public-api.mjs";

// Import needed components from the real package for the wrappers
// @ts-ignore
import { 
  PModal as PDSModal,
  PHeading as PDSHeading
} from '../node_modules/@porsche-design-system/components-react/esm/public-api.mjs';

export const PHeading = ({ children, size, align, color, style, tag }: any) => {
  return (
    <PDSHeading 
      size={size || 'medium'} 
      align={align || 'start'} 
      color={color || 'primary'} 
      tag={tag || 'h2'}
      style={style}
    >
      {children}
    </PDSHeading>
  );
};

export const PModal = ({ 
  open, isOpen, 
  heading, title, 
  onClose, dismissButton, 
  children,
  aria,
  style
}: any) => {
  // Support both 'open' and 'isOpen' for compatibility
  const isCurrentlyOpen = open || isOpen;
  
  return (
    <PDSModal
      open={isCurrentlyOpen}
      heading={heading || title}
      onClose={onClose}
      dismissButton={dismissButton !== undefined ? dismissButton : true}
      aria={aria}
      style={style}
    >
      {children}
    </PDSModal>
  );
};

export const PText = ({ children, size, theme, style, weight }: any) => (
  <span style={{ 
    fontSize: size === 'small' ? '0.875rem' : size === 'x-small' ? '0.75rem' : '1rem', 
    color: theme === 'dark' ? 'white' : 'inherit',
    fontWeight: weight === 'semi-bold' ? 600 : weight === 'bold' ? 700 : 400,
    display: 'inline-block',
    ...style 
  }}>{children}</span>
);

export const PButton = ({ children, variant, onClick, icon, theme, size, type, hideLabel, style, loading }: any) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const isSecondary = variant === 'secondary';
  
  const getBgColor = () => {
    if (variant === 'primary') return isHovered ? '#E6001E' : 'var(--tf-accent, #D5001C)';
    return isHovered ? 'rgba(255, 255, 255, 0.1)' : 'transparent';
  };

  return (
    <button 
      type={type || 'button'}
      onClick={onClick}
      disabled={loading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: size === 'small' ? '6px 12px' : '10px 20px',
        backgroundColor: getBgColor(),
        color: 'white',
        border: isSecondary ? `1px solid ${isHovered ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'}` : 'none',
        borderRadius: '4px',
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '14px',
        fontWeight: 600,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        whiteSpace: 'nowrap',
        opacity: loading ? 0.7 : 1,
        ...style
      }}
    >
      {children}
    </button>
  );
};

export const PTag = ({ children, color, style }: any) => {
  const getColors = () => {
    switch (color) {
      case 'success': return { bg: '#01ba6d22', text: '#01ba6d' };
      case 'error': return { bg: '#ff444422', text: '#ff4444' };
      case 'warning': return { bg: '#ffcc0022', text: '#ffcc00' };
      default: return { bg: 'rgba(255,255,255,0.1)', text: 'white' };
    }
  };
  const colors = getColors();
  return (
    <span style={{
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: 700,
      backgroundColor: colors.bg,
      color: colors.text,
      border: `1px solid ${colors.text}44`,
      display: 'inline-flex',
      alignItems: 'center',
      ...style
    }}>
      {children}
    </span>
  );
};

export const PDivider = ({ style }: any) => (
  <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '16px 0', ...style }} />
);

export const PInlineNotification = ({ heading, description, state, style }: any) => {
  const color = state === 'error' ? '#ff4444' : state === 'success' ? '#01ba6d' : '#ffcc00';
  return (
    <div style={{
      padding: '16px',
      borderRadius: '8px',
      backgroundColor: `${color}11`,
      borderLeft: `4px solid ${color}`,
      marginBottom: '16px',
      ...style
    }}>
      {heading && <div style={{ fontWeight: 700, marginBottom: '4px', color }}>{heading}</div>}
      {description && <div style={{ fontSize: '14px', opacity: 0.9 }}>{description}</div>}
    </div>
  );
};

export const PTabs = ({ children, activeTabIndex, onChange, style }: any) => {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px', ...style }}>
      {React.Children.map(children, (child: any, index) => {
        if (!child) return null;
        return React.cloneElement(child, {
          isActive: index === activeTabIndex,
          onClick: () => onChange && onChange({ activeTabIndex: index })
        });
      })}
    </div>
  );
};

export const PTabsItem = ({ label, isActive, onClick }: any) => (
  <button
    onClick={onClick}
    style={{
      padding: '12px 24px',
      background: 'none',
      border: 'none',
      color: isActive ? 'var(--tf-accent, #D5001C)' : 'white',
      borderBottom: isActive ? '2px solid var(--tf-accent, #D5001C)' : '2px solid transparent',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 600,
      transition: 'all 0.2s ease',
      opacity: isActive ? 1 : 0.6
    }}
  >
    {label}
  </button>
);

export const PLink = ({ children, href, style }: any) => (
  <a href={href} style={{ color: 'var(--tf-accent, #D5001C)', textDecoration: 'none', fontWeight: 600, ...style }}>
    {children}
  </a>
);

export const PTextarea = ({ label, value, onInput, placeholder, disabled, name, description, style }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', ...style }}>
    {label && <label style={{ fontSize: '14px', fontWeight: 600, opacity: 0.6 }}>{label}</label>}
    <textarea
      value={value}
      onChange={(e) => onInput && onInput({ target: { value: e.target.value, name } })}
      placeholder={placeholder}
      disabled={disabled}
      name={name}
      style={{
        backgroundColor: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '12px',
        color: 'white',
        minHeight: '100px',
        fontFamily: 'inherit',
        fontSize: '14px'
      }}
    />
    {description && <span style={{ fontSize: '12px', opacity: 0.5 }}>{description}</span>}
  </div>
);