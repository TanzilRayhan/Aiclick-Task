import axios from 'axios';

let API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
if (API_BASE_URL && !API_BASE_URL.endsWith('/api/v1')) {
    API_BASE_URL = `${API_BASE_URL.replace(/\/$/, '')}/api/v1`;
}

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const MentionsService = {
    getMentions: async (data: any) => {
        const response = await apiClient.post('/mentions/', data);
        return response.data;
    },
    getSummary: async () => {
        const response = await apiClient.get('/mentions/summary');
        return response.data;
    },
    getTrends: async (days: number = 30) => {
        const response = await apiClient.get(`/mentions/trends?days=${days}`);
        return response.data;
    },
};
