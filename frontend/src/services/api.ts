import axios from 'axios';

// In dev, VITE_API_URL is unset → '/api' goes through the Vite proxy.
// In production (Vercel), set VITE_API_URL to the backend URL (e.g. Render).
const API_BASE = import.meta.env.VITE_API_URL ?? '';

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
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

// ─── A/B Testing ──────────────────────────────────────────
export type ABTestStatus = 'DRAFT' | 'RUNNING' | 'COMPLETED';

export interface MessageVariant {
  id: string;
  name: string;
  message: string;
  tone: string;
  includesOffer: boolean;
}

export interface ABTest {
  id: string;
  clinicId: string;
  status: ABTestStatus;
  consentGiven: boolean;
  generatedAt: string;
  variants: MessageVariant[];
}

export interface VariantResult {
  variantId: string;
  name: string;
  sent: number;
  converted: number;
  conversionRate: number;
}

export const abTestApi = {
  create: (clinicId: string, variantCount = 3) =>
    api
      .post<ABTest>(`/clinics/${clinicId}/ab-tests`, { consentGiven: true, variantCount })
      .then((r) => r.data),
  list: (clinicId: string) =>
    api.get<ABTest[]>(`/clinics/${clinicId}/ab-tests`).then((r) => r.data),
  results: (testId: string) =>
    api.get<VariantResult[]>(`/ab-tests/${testId}/results`).then((r) => r.data),
};

// ─── Reports ──────────────────────────────────────────────
export interface Report {
  id: string;
  clinicId: string;
  period: string;
  pdfUrl: string | null;
  createdAt: string;
}

export const reportApi = {
  generate: (clinicId: string, period: string) =>
    api.post<Report>(`/clinics/${clinicId}/reports`, { period }).then((r) => r.data),
  list: (clinicId: string) =>
    api.get<Report[]>(`/clinics/${clinicId}/reports`).then((r) => r.data),
};
