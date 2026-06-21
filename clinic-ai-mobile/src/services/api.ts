import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Point to your backend — change for production.
const BASE_URL = __DEV__ ? 'http://localhost:4000/api' : 'https://api.clinic-ai.com/api';

export const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('clinic_ai_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Types ────────────────────────────────────────────────
export type LeadStatus = 'NEW' | 'ENGAGED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';

export interface Lead {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  tags: string[];
  status: LeadStatus;
  messageCount: number;
  lastMessageDate: string | null;
}

export interface DashboardMetrics {
  totalLeads: number;
  byStatus: Record<string, number>;
  conversionRate: number;
  totalMessages: number;
  leadsOverTime: { date: string; count: number }[];
  funnel: { stage: string; count: number }[];
}

// ─── API helpers ──────────────────────────────────────────
export const metricsApi = {
  overview: (clinicId: string) =>
    api.get<DashboardMetrics>(`/clinics/${clinicId}/metrics`).then((r) => r.data),
  leads: (clinicId: string) =>
    api.get<Lead[]>(`/clinics/${clinicId}/leads`).then((r) => r.data),
};
