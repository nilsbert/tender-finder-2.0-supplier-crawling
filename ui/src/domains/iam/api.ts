import axios from 'axios';

// The IAM service runs on port 8001 (default) or as set in env
const API_URL = `/iam/admin/api`;

export interface IamUser {
  oid: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  last_login_at?: string;
  created_at: string;
}

export interface UserRegistry {
  users: IamUser[];
  total: number;
}

export interface AuthConfig {
  mode: 'STRICT' | 'OPEN';
  whitelisted_domains: string[];
  whitelisted_emails: string[];
}

export interface ApprovalRequest {
  email: string;
  full_name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export const iamApi = {
  getUsers: async (skip = 0, limit = 50) => {
    const response = await axios.get<UserRegistry>(`${API_URL}/users`, { params: { skip, limit } });
    return response.data;
  },
  
  getAdmins: async () => {
    const response = await axios.get<{ admins: string[] }>(`${API_URL}/admins`);
    return response.data;
  },
  
  promoteToAdmin: async (email: string) => {
    const response = await axios.post(`${API_URL}/admins`, { email });
    return response.data;
  },
  
  revokeAdmin: async (email: string) => {
    const response = await axios.delete(`${API_URL}/admins/${email}`);
    return response.data;
  },
  
  getConfig: async () => {
    const response = await axios.get<AuthConfig>(`${API_URL}/auth/config`);
    return response.data;
  },
  
  setAuthMode: async (mode: 'STRICT' | 'OPEN') => {
    const response = await axios.post(`${API_URL}/auth/config/mode`, null, { params: { mode } });
    return response.data;
  },
  
  addWhitelist: async (params: { email?: string; domain?: string }) => {
    const response = await axios.post(`${API_URL}/auth/config/whitelist`, null, { params });
    return response.data;
  },
  
  removeWhitelist: async (params: { email?: string; domain?: string }) => {
    const response = await axios.delete(`${API_URL}/auth/config/whitelist`, { params });
    return response.data;
  },
  
  getApprovals: async () => {
    const response = await axios.get<ApprovalRequest[]>(`${API_URL}/auth/config/approvals`);
    return response.data;
  },
  
  approveRequest: async (email: string) => {
    const response = await axios.post(`${API_URL}/auth/config/approvals/${email}/approve`);
    return response.data;
  }
};
