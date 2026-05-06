import { useState, useEffect } from 'react';
import {PHeading,
  PText,
  PTabs,
  PTabsItem,
  PTable,
  PTableHead,
  PTableHeadRow,
  PTableHeadCell,
  PTableBody,
  PTableRow,
  PTableCell,
  PButton,
  PFlex,
  PFlexItem,
  PSpinner,
  PInlineNotification,
  PTag} from '@porsche-design-system/components-react';
import { ProcessHeader } from '../../components/ProcessHeader';
import { iamApi, IamUser, AuthConfig, ApprovalRequest } from './api';

export const IAMApp = () => {
  const [users, setUsers] = useState<IamUser[]>([]);
  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const refreshData = async () => {
    try {
      setLoading(true);
      const [usersData, configData, approvalsData] = await Promise.all([
        iamApi.getUsers(),
        iamApi.getConfig(),
        iamApi.getApprovals()
      ]);
      setUsers(usersData.users);
      setConfig(configData);
      setApprovals(approvalsData);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch IAM data', err);
      setError('Could not connect to the IAM service. Please ensure the tender-iam container is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleModeToggle = async () => {
    if (!config) return;
    const newMode = config.mode === 'STRICT' ? 'OPEN' : 'STRICT';
    try {
      await iamApi.setAuthMode(newMode);
      await refreshData();
    } catch (err) {
      setError('Failed to update authentication mode.');
    }
  };

  const handleApprove = async (email: string) => {
    try {
      await iamApi.approveRequest(email);
      await refreshData();
    } catch (err) {
      setError('Failed to approve request.');
    }
  };

  if (loading && !config) {
    return (
      <div className="p-content-wrapper">
        <PFlex justifyContent="center" style={{ padding: '100px' }}>
          <PSpinner size="large" />
        </PFlex>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <ProcessHeader activeItem="iam" />
      <div className="p-content-wrapper">
        <div style={{ padding: '32px 0' }}>
        <header style={{ marginBottom: '32px', borderLeft: '4px solid #d5001c', paddingLeft: '24px' }}>
          <PHeading size="large" tag="h1" style={{ textTransform: 'uppercase', letterSpacing: '-0.02em', fontWeight: 800 }}>
            Sovereign Identity
          </PHeading>
          <PText weight="semi-bold" color="contrast-medium" style={{ textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '12px' }}>
            Domain Isolation Layer | Port 8001
          </PText>
        </header>

        {error && (
          <PInlineNotification 
            state="error" 
            style={{ marginBottom: '24px' }} 
            onDismiss={() => setError(null)}
          >
            {error}
          </PInlineNotification>
        )}

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1px', 
          backgroundColor: '#e0e0e0', 
          border: '1px solid #e0e0e0',
          marginBottom: '32px' 
        }}>
          <StatBox label="Auth Mode" value={config?.mode || '---'} color={config?.mode === 'STRICT' ? '#d5001c' : '#10b981'} />
          <StatBox label="Identities" value={users.length.toString()} />
          <StatBox label="Admins" value={users.filter(u => u.role === 'admin').length.toString()} color="#d5001c" />
          <StatBox label="Perimeter" value="Hardened" icon="pulse" />
        </div>

        <PTabs activeTabIndex={0}>
          <PTabsItem label="Registry">
            <div style={{ marginTop: '24px' }}>
              <PTable>
                <span slot="caption">Authenticated Domain Users</span>
                <PTableHead>
                  <PTableHeadRow>
                    <PTableHeadCell>Identity</PTableHeadCell>
                    <PTableHeadCell>Role</PTableHeadCell>
                    <PTableHeadCell>Last Access</PTableHeadCell>
                    <PTableHeadCell>Actions</PTableHeadCell>
                  </PTableHeadRow>
                </PTableHead>
                <PTableBody>
                  {users.map(user => (
                    <PTableRow key={user.oid}>
                      <PTableCell>
                        <PText weight="bold">{user.full_name || 'Unidentified'}</PText>
                        <PText size="small" color="contrast-medium">{user.email}</PText>
                      </PTableCell>
                      <PTableCell>
                        <PTag color={user.role === 'admin' ? 'notification-error' : 'neutral-contrast-high'}>
                          {user.role.toUpperCase()}
                        </PTag>
                      </PTableCell>
                      <PTableCell>
                        <PText size="small">{user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}</PText>
                      </PTableCell>
                      <PTableCell>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {user.role === 'admin' ? (
                            <PButton 
                              variant="secondary" 
                              onClick={() => iamApi.revokeAdmin(user.email).then(refreshData)}
                              disabled={user.email === 'nils.hyoma@mhp.com'}
                            >
                              Revoke Admin
                            </PButton>
                          ) : (
                            <PButton 
                              variant="primary" 
                              onClick={() => iamApi.promoteToAdmin(user.email).then(refreshData)}
                            >
                              Make Admin
                            </PButton>
                          )
                          }
                        </div>
                      </PTableCell>
                    </PTableRow>
                  ))}
                </PTableBody>
              </PTable>
            </div>
          </PTabsItem>
          
          <PTabsItem label="Perimeter Whitelist">
            <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <div>
                <PHeading size="small" style={{ marginBottom: '16px' }}>Corporate Domains</PHeading>
                <WhitelistForm type="domain" onAdd={(v: string) => iamApi.addWhitelist({ domain: v }).then(refreshData)} />
                <div style={{ marginTop: '16px' }}>
                  {config?.whitelisted_domains.map(d => (
                    <WhitelistItem key={d} label={`@${d}`} onDelete={() => iamApi.removeWhitelist({ domain: d }).then(refreshData)} />
                  ))}
                </div>
              </div>
              <div>
                <PHeading size="small" style={{ marginBottom: '16px' }}>Individual Guests</PHeading>
                <WhitelistForm type="email" onAdd={(v: string) => iamApi.addWhitelist({ email: v }).then(refreshData)} />
                <div style={{ marginTop: '16px' }}>
                  {config?.whitelisted_emails.map(e => (
                    <WhitelistItem key={e} label={e} onDelete={() => iamApi.removeWhitelist({ email: e }).then(refreshData)} />
                  ))}
                </div>
              </div>
            </div>
          </PTabsItem>

          <PTabsItem label={`Approval Queue (${approvals.length})`}>
            <div style={{ marginTop: '24px' }}>
              <PTable>
                <span slot="caption">Blocked Identities Awaiting Access</span>
                <PTableHead>
                  <PTableHeadRow>
                    <PTableHeadCell>Identity</PTableHeadCell>
                    <PTableHeadCell>Timestamp</PTableHeadCell>
                    <PTableHeadCell>Actions</PTableHeadCell>
                  </PTableHeadRow>
                </PTableHead>
                <PTableBody>
                  {approvals.length === 0 && (
                    <PTableRow>
                      <PTableCell>
                        <div style={{ textAlign: 'center', padding: '48px', gridColumn: 'span 3' }}>
                          <PText color="contrast-medium">Zero Intercept Events. Perimeter Secure.</PText>
                        </div>
                      </PTableCell>
                      <PTableCell></PTableCell>
                      <PTableCell></PTableCell>
                    </PTableRow>
                  )}
                  {approvals.map(req => (
                    <PTableRow key={req.email}>
                      <PTableCell>
                        <PText weight="bold">{req.full_name}</PText>
                        <PText size="small" color="contrast-medium">{req.email}</PText>
                      </PTableCell>
                      <PTableCell>
                        <PText size="small">{new Date(req.created_at).toLocaleString()}</PText>
                      </PTableCell>
                      <PTableCell>
                        <div style={{ textAlign: 'right' }}>
                          <PButton variant="primary" onClick={() => handleApprove(req.email)}>
                            Approve Access
                          </PButton>
                        </div>
                      </PTableCell>
                    </PTableRow>
                  ))}
                </PTableBody>
              </PTable>
            </div>
          </PTabsItem>

          <PTabsItem label="Security Policy">
            <div style={{ marginTop: '24px', maxWidth: '600px' }}>
              <PHeading size="small" style={{ marginBottom: '16px' }}>Global Authentication Policy</PHeading>
              <div style={{ padding: '24px', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                <PFlex alignItems="center" justifyContent="space-between">
                  <div>
                    <PText weight="bold">Auth Mode: {config?.mode}</PText>
                    <PText size="small" color="contrast-medium">
                      {config?.mode === 'STRICT' 
                        ? 'Only allow users from whitelisted domains or direct email list.' 
                        : 'Allow any identity from the tenant; auto-capture and request approval.'}
                    </PText>
                  </div>
                  <PButton variant="secondary" onClick={handleModeToggle}>
                    Switch to {config?.mode === 'STRICT' ? 'OPEN' : 'STRICT'}
                  </PButton>
                </PFlex>
              </div>
            </div>
          </PTabsItem>
        </PTabs>
      </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, color = '#000', icon }: any) => (
  <div style={{ backgroundColor: '#fff', padding: '24px', textAlign: 'left' }}>
    <PText size="small" weight="bold" color="contrast-medium" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
      {label}
    </PText>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {icon === 'pulse' && <div style={{ width: '8px', height: '8px', backgroundColor: '#d5001c', borderRadius: '50%', animation: 'pulse 2s infinite' }} />}
      <PHeading size="medium" style={{ color, letterSpacing: '-0.02em', fontWeight: 800 }}>{value}</PHeading>
    </div>
    <style>{`
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.4; }
        100% { opacity: 1; }
      }
    `}</style>
  </div>
);

const WhitelistForm = ({ type, onAdd }: any) => {
  const [value, setValue] = useState('');
  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (value) {
      onAdd(value);
      setValue('');
    }
  };
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
      <input 
        type="text" 
        placeholder={type === 'domain' ? 'DOMAIN (e.g. mhp.com)' : 'EMAIL ADDRESS'} 
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ flex: 1, padding: '8px 12px', border: '1px solid #e0e0e0', fontSize: '13px' }}
      />
      <PButton variant="primary" type="submit">Add</PButton>
    </form>
  );
};

const WhitelistItem = ({ label, onDelete }: any) => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '12px', 
    backgroundColor: '#f8f8f8', 
    border: '1px solid #e0e0e0',
    marginBottom: '8px'
  }}>
    <PText weight="bold" size="small" style={{ letterSpacing: '0.05em' }}>{label}</PText>
    <PButton variant="ghost" icon="delete" onClick={onDelete} />
  </div>
);

export default IAMApp;
