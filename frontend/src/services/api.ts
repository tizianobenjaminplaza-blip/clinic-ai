import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach the stored token to every request (Auth0 integration point).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('clinic_ai_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Domain types (mirror backend responses) ──────────────
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
  inactivityDays: number;
}

export interface DashboardMetrics {
  totalLeads: number;
  byStatus: Record<string, number>;
  conversionRate: number;
  totalMessages: number;
  leadsOverTime: { date: string; count: number }[];
  funnel: { stage: string; count: number }[];
}

export const metricsApi = {
  overview: (clinicId: string) =>
    api.get<DashboardMetrics>(`/clinics/${clinicId}/metrics`).then((r) => r.data),
  leads: (clinicId: string) =>
    api.get<Lead[]>(`/clinics/${clinicId}/leads`).then((r) => r.data),
};
