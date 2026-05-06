const API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE = '/api/distributing';

const safeJson = async (res: Response) => {
    try {
        const text = await res.text();
        return JSON.parse(text);
    } catch (e) {
        return null;
    }
};

export interface Webhook {
    id: string;
    name: string;
    description?: string;
    webhook_url: string;
    label_id?: string;
    office_id?: string;
    match_threshold?: number;
    scope_type: string;
    scope_value?: string;
    is_active: boolean;
    last_failure_at?: string;
    failure_count: number;
    created_at: string;
}

export interface TreeOption {
    label: string
    value: string
    children?: TreeOption[]
}

export interface DistributionOffice {
    id: string;
    name: string;
    description?: string;
    city?: string;
    state?: string;
    country?: string;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface WebhookCreate {
    name: string;
    description?: string;
    webhook_url: string;
    label_id?: string;
    office_id?: string;
    match_threshold?: number;
    scope_type?: string;
    scope_value?: string;
    is_active?: boolean;
}

export interface Label {
    id: string;
    name: string;
    description?: string;
    type: string;
    is_system: boolean;
    active: boolean;
    created_at: string;
}

export interface LabelCreate {
    name: string;
    description?: string;
    type?: string;
    active?: boolean;
}

export interface DistributionLog {
    id: string;
    tender_id: string;
    webhook_id: string;
    status: 'SENT' | 'FAILED';
    response_code?: number;
    error_message?: string;
    sent_at: string;
    tender_title: string;
    webhook_name: string;
}

export interface ActiveChannel {
    id: string;
    name: string;
    type: 'LABEL' | 'SECTOR' | 'SERVICE' | 'OFFICE' | 'ALL';
    description?: string;
    webhook_count: number;
}

export const distributingApi = {
    getWebhooks: async (): Promise<Webhook[]> => {
        const res = await fetch(`${API_BASE}/webhooks`);
        if (!res.ok) throw new Error('Failed to fetch webhooks');
        return res.json();
    },

    createWebhook: async (data: WebhookCreate): Promise<Webhook> => {
        const res = await fetch(`${API_BASE}/webhooks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await safeJson(res);
            throw new Error(err?.detail || `Failed to create webhook: ${res.statusText}`);
        }
        return res.json();
    },

    updateWebhook: async (id: string, data: Partial<WebhookCreate>): Promise<Webhook> => {
        const res = await fetch(`${API_BASE}/webhooks/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await safeJson(res);
            throw new Error(err?.detail || `Failed to update webhook: ${res.statusText}`);
        }
        return res.json();
    },

    deleteWebhook: async (id: string): Promise<void> => {
        const res = await fetch(`${API_BASE}/webhooks/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete webhook');
    },

    getLabels: async (): Promise<Label[]> => {
        const res = await fetch(`${API_BASE}/labels`);
        if (!res.ok) throw new Error('Failed to fetch labels');
        return res.json();
    },

    createLabel: async (data: LabelCreate): Promise<Label> => {
        const res = await fetch(`${API_BASE}/labels`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await safeJson(res);
            throw new Error(err?.detail || `Failed to create label: ${res.statusText}`);
        }
        return res.json();
    },

    updateLabel: async (id: string, data: Partial<LabelCreate>): Promise<Label> => {
        const res = await fetch(`${API_BASE}/labels/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await safeJson(res);
            throw new Error(err?.detail || `Failed to update label: ${res.statusText}`);
        }
        return res.json();
    },

    deleteLabel: async (id: string): Promise<void> => {
        const res = await fetch(`${API_BASE}/labels/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) {
            const err = await safeJson(res);
            throw new Error(err?.detail || `Failed to delete label: ${res.statusText}`);
        }
    },

    getLogs: async (limit: number = 50): Promise<DistributionLog[]> => {
        const res = await fetch(`${API_BASE}/logs?limit=${limit}`);
        if (!res.ok) throw new Error('Failed to fetch logs');
        return res.json();
    },

    testConnection: async (url: string): Promise<any> => {
        const res = await fetch(`${API_BASE}/webhooks/test-connection`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ webhook_url: url }),
        });
        return safeJson(res);
    },

    // --- Offices ---

    getOffices: async (): Promise<DistributionOffice[]> => {
        const res = await fetch(`${API_BASE}/offices`);
        return safeJson(res);
    },

    createOffice: async (office: Partial<DistributionOffice>): Promise<DistributionOffice> => {
        const res = await fetch(`${API_BASE}/offices`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(office),
        });
        return safeJson(res);
    },

    updateOffice: async (id: string, office: Partial<DistributionOffice>): Promise<DistributionOffice> => {
        const res = await fetch(`${API_BASE}/offices/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(office),
        });
        return safeJson(res);
    },

    deleteOffice: async (id: string): Promise<any> => {
        const res = await fetch(`${API_BASE}/offices/${id}`, {
            method: 'DELETE',
        });
        return safeJson(res);
    },

    getConfigStatus: async (): Promise<{ mode: string; error?: string }> => {
        const res = await fetch(`${API_ROOT}/config/status`);
        if (!res.ok) throw new Error('Failed to fetch config status');
        return res.json();
    },



    getActiveChannels: async (): Promise<ActiveChannel[]> => {
        const res = await fetch(`${API_BASE}/channels`);
        if (!res.ok) throw new Error('Failed to fetch active channels');
        return res.json();
    },

    distributeTender: async (tenderId: string, force: boolean = true, target?: { id: string; type: string }): Promise<any> => {
        const payload: any = { tender_id: tenderId, force };
        if (target) {
            payload.target_channel_id = target.id;
            payload.target_channel_type = target.type;
        }

        const res = await fetch(`${API_BASE}/send/${tenderId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const err = await safeJson(res);
            throw new Error(err?.detail || `Failed to distribute tender: ${res.statusText}`);
        }
        return res.json();
    },

    getScopeOptions: async (scopeType: string): Promise<TreeOption[]> => {
        const res = await fetch(`${API_BASE}/scope-options/${scopeType}`);
        if (!res.ok) throw new Error('Failed to fetch scope options');
        return res.json();
    }
};
