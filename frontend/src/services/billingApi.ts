import { api } from './api';

export interface SubscriptionStatus {
  plan: string;
  status: string;
  isAgentActive: boolean;
  startDate: string | null;
  stripeMockMode: boolean;
}

export const billingApi = {
  status: (clinicId: string) =>
    api.get<SubscriptionStatus>(`/clinics/${clinicId}/subscription`).then((r) => r.data),

  /** Real Stripe checkout. Returns { url } to redirect to, or 503 in mock mode. */
  checkout: (clinicId: string) =>
    api.post<{ url: string }>('/payments/checkout', { clinicId }).then((r) => r.data),

  /** Demo activation (only works while Stripe is unconfigured). */
  demoActivate: (clinicId: string) =>
    api.post<{ activated: boolean; plan: string }>('/payments/demo-activate', { clinicId }).then((r) => r.data),
};
