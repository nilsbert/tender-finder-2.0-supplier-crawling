import React from 'react';
import { PFlex } from '../pds-wrapper';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../domains/auth/AuthProvider';

interface AdminHeaderProps {
  activeService?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ activeService }) => {
  const { t, i18n } = useTranslation();
  const { identity } = useAuth();

    const services = [
    { id: 'crawling', name: 'Crawling', path: '/ms/crawling/', title: 'Data Collection' },
    { id: 'enriching', name: 'Enriching', path: '/ms/enriching/', title: 'Enriching' },
    { id: 'ai', name: 'AI Service', path: '/ms/ai/', title: 'AI Service' },
    { id: 'iam', name: 'IAM', path: '/ms/iam/admin', title: 'IAM' },
    { id: 'distributing', name: 'Distributing', path: '/ms/distributing/', title: 'Distributing' },
  ];

  const currentService = services.find(s => s.id === activeService);

  const languages = [
    { code: 'de', label: 'DE' },
    { code: 'en', label: 'EN' },
  ];

  return (
    <header style={{
      backgroundColor: 'rgba(17, 17, 17, 0.85)',
      borderBottom: '1px solid var(--tf-border)',
      padding: '0 40px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backdropFilter: 'blur(16px)',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <PFlex alignItems="center" style={{ gap: '24px', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg viewBox="0 0 32 32" style={{ width: '28px', height: '28px' }}>
            <rect width="32" height="32" rx="6" fill="var(--tf-accent)" />
            <path d="M8 16L14 10L20 16L14 22Z" fill="#fff" />
          </svg>
          <span style={{ margin: 0, letterSpacing: '-0.02em', whiteSpace: 'nowrap', fontWeight: 700, fontSize: '16px', color: '#fff' }}>
            TENDER FINDER <span style={{ fontWeight: 300, opacity: 0.5 }}>| {currentService?.title || 'Admin Suite'}</span>
          </span>
        </div>

        <nav style={{ display: 'flex', gap: '4px', marginLeft: '24px', height: '100%' }}>
          {services.map((s) => {
            const isActive = location.pathname.includes(`/${s.id}`);
            
            return (
              <a
                key={s.id}
                href={s.path}
                style={{
                  textDecoration: 'none',
                  padding: '0 16px',
                  height: '64px',
                  display: 'flex',
                  alignItems: 'center',
                  color: isActive ? 'var(--tf-white)' : 'var(--tf-text-secondary)',
                  fontSize: '13px',
                  fontWeight: isActive ? '600' : '500',
                  transition: 'all 0.2s ease',
                  borderBottom: isActive ? '2px solid var(--tf-accent)' : '2px solid transparent',
                  backgroundColor: isActive ? 'rgba(213, 0, 28, 0.05)' : 'transparent',
                }}
              >
                {s.name}
              </a>
            );
          })}
        </nav>
      </PFlex>

      <PFlex alignItems="center" style={{ gap: '16px' }}>
        {/* Language Switcher */}
        <div style={{ display: 'flex', gap: '4px', marginRight: '16px' }}>
          {languages.map(l => (
            <button
              key={l.code}
              onClick={() => i18n.changeLanguage(l.code)}
              style={{
                background: i18n.language === l.code ? 'var(--tf-accent)' : 'rgba(255,255,255,0.05)',
                border: 'none',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* System Status */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '4px 12px', 
          backgroundColor: 'rgba(1, 186, 109, 0.1)', 
          borderRadius: '100px', 
          border: '1px solid rgba(1, 186, 109, 0.2)' 
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#01ba6d' }} />
          <span style={{ color: '#01ba6d', fontWeight: 'bold', fontSize: '10px' }}>ONLINE</span>
        </div>

        {/* User Info */}
        {identity && (
          <div style={{ color: 'var(--tf-text-secondary)', fontSize: '12px', borderLeft: '1px solid var(--tf-border)', paddingLeft: '16px' }}>
            {identity.name}
          </div>
        )}
      </PFlex>
    </header>
  );
};

export default AdminHeader;
