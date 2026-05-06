import axios from 'axios';
import type { StartupStatus } from './types';

const API_URL = ''; // Use relative path to go through Vite proxy

export const startupService = {
    getStartupStatus: async (): Promise<StartupStatus> => {
        const response = await axios.get<StartupStatus>(`${API_URL}/api/system/startup-status`);
        return response.data;
    },
    retryStartup: async (): Promise<void> => {
        await axios.post(`${API_URL}/api/system/startup/retry`);
    }
};

console.log('[StartupService] Using API URL:', API_URL);
