import type {
    BidDecisionFull,
    BidDecisionCreate,
    TenderOwnership,
    TenderComment,
    Person,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';

export interface ListDecisionsFilters {
    decision?: string;
    since?: string;
    until?: string;
    limit?: number;
    offset?: number;
}

export interface ListClaimedFilters {
    search?: string;
    website?: string;
    crawled_since?: string;
    due_until?: string;
    limit?: number;
    offset?: number;
}

export const bidDecisionApi = {
    async createDecision(data: BidDecisionCreate): Promise<BidDecisionFull> {
        const response = await fetch(`${API_BASE_URL}/decisions/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Failed to create decision' }));
            throw new Error(error.detail || 'Failed to create decision');
        }

        return response.json();
    },

    async getDecisionByTender(tenderId: string): Promise<BidDecisionFull | null> {
        const response = await fetch(`${API_BASE_URL}/decisions/tender/${tenderId}`);



        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Failed to fetch decision' }));
            throw new Error(error.detail || 'Failed to fetch decision');
        }

        return response.json();
    },

    async getDecisionById(decisionId: string): Promise<BidDecisionFull> {
        const response = await fetch(`${API_BASE_URL}/decisions/${decisionId}`);

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Decision not found' }));
            throw new Error(error.detail || 'Decision not found');
        }

        return response.json();
    },

    async updateDecision(decisionId: string, data: BidDecisionCreate): Promise<BidDecisionFull> {
        const response = await fetch(`${API_BASE_URL}/decisions/${decisionId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Failed to update decision' }));
            throw new Error(error.detail || 'Failed to update decision');
        }

        return response.json();
    },

    async listDecisions(filters?: ListDecisionsFilters): Promise<BidDecisionFull[]> {
        const params = new URLSearchParams();

        if (filters) {
            if (filters.decision) params.append('decision', filters.decision);
            if (filters.since) params.append('since', filters.since);
            if (filters.until) params.append('until', filters.until);
            if (filters.limit) params.append('limit', filters.limit.toString());
            if (filters.offset) params.append('offset', filters.offset.toString());
        }

        const url = `${API_BASE_URL}/decisions/?${params.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Failed to list decisions' }));
            throw new Error(error.detail || 'Failed to list decisions');
        }

        return response.json();
    },
};

export const bidGovernanceApi = {
    async getOwnership(tenderId: string): Promise<TenderOwnership> {
        const response = await fetch(`${API_BASE_URL}/bid-governance/ownership/${tenderId}`);
        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Failed to fetch ownership' }));
            throw new Error(error.detail || 'Failed to fetch ownership');
        }
        return response.json();
    },

    async claimTender(tenderId: string, driver: Person): Promise<TenderOwnership> {
        const response = await fetch(`${API_BASE_URL}/bid-governance/ownership/${tenderId}/claim`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ driver }),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Failed to claim tender' }));
            throw new Error(error.detail || 'Failed to claim tender');
        }
        return response.json();
    },

    async releaseTender(tenderId: string): Promise<TenderOwnership> {
        const response = await fetch(`${API_BASE_URL}/bid-governance/ownership/${tenderId}/release`, {
            method: 'POST',
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Failed to release tender' }));
            throw new Error(error.detail || 'Failed to release tender');
        }
        return response.json();
    },

    async addCoDriver(tenderId: string, person: Person): Promise<TenderOwnership> {
        const response = await fetch(`${API_BASE_URL}/bid-governance/ownership/${tenderId}/co-drivers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ person }),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Failed to add co-driver' }));
            throw new Error(error.detail || 'Failed to add co-driver');
        }
        return response.json();
    },

    async removeCoDriver(tenderId: string, email: string): Promise<TenderOwnership> {
        const response = await fetch(`${API_BASE_URL}/bid-governance/ownership/${tenderId}/co-drivers/${encodeURIComponent(email)}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Failed to remove co-driver' }));
            throw new Error(error.detail || 'Failed to remove co-driver');
        }
        return response.json();
    },

    async listComments(tenderId: string): Promise<TenderComment[]> {
        const response = await fetch(`${API_BASE_URL}/bid-governance/comments/${tenderId}`);
        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Failed to fetch comments' }));
            throw new Error(error.detail || 'Failed to fetch comments');
        }
        return response.json();
    },

    async addComment(tenderId: string, author: Person, body: string): Promise<TenderComment> {
        const response = await fetch(`${API_BASE_URL}/bid-governance/comments/${tenderId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ author, body }),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Failed to add comment' }));
            throw new Error(error.detail || 'Failed to add comment');
        }
        return response.json();
    },

    async listClaimedTenders(filters?: ListClaimedFilters): Promise<any[]> {
        const params = new URLSearchParams();

        if (filters) {
            if (filters.search) params.append('search', filters.search);
            if (filters.website) params.append('website', filters.website);
            if (filters.crawled_since) params.append('crawled_since', filters.crawled_since);
            if (filters.due_until) params.append('due_until', filters.due_until);
            if (filters.limit) params.append('limit', filters.limit.toString());
            if (filters.offset) params.append('offset', filters.offset.toString());
        }

        const url = `${API_BASE_URL}/bid-governance/claimed?${params.toString()}`;
        const response = await fetch(url);
        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Failed to list claimed tenders' }));
            throw new Error(error.detail || 'Failed to list claimed tenders');
        }
        return response.json();
    },
};
