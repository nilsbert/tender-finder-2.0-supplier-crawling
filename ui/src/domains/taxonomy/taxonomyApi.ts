
/// <reference types="vite/client" />
const API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE = '/api/taxonomy';

const safeJson = async (res: Response) => {
    try {
        const text = await res.text();
        return JSON.parse(text);
    } catch (e) {
        return null;
    }
};

export interface Label {
    id: string;
    name: string;
    description?: string;
    type: string;
    is_system: boolean;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface LabelCreate {
    name: string;
    description?: string;
    type: string;
    active?: boolean;
}

export interface LabelUpdate {
    description?: string;
    active?: boolean;
    name?: string;
}

export const taxonomyApi = {
    getLabels: async (activeOnly: boolean = false, type?: string): Promise<Label[]> => {
        let url = `${API_BASE}/labels?active_only=${activeOnly}`;
        if (type) {
            url += `&type=${type}`;
        }
        const res = await fetch(url);
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

    updateLabel: async (id: string, data: LabelUpdate): Promise<Label> => {
        const res = await fetch(`${API_BASE}/labels/${id}`, {
            method: 'PUT', // Backend uses PUT for full update or strict schema, but my routes used PUT. 
            // Wait, routes.py said: @router.put("/labels/{label_id}", ...). 
            // But typical PATCH semantics for partial. 
            // My Pydantic LabelUpdate has all fields optional. 
            // Start with PUT as implemented in backend.
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
};
