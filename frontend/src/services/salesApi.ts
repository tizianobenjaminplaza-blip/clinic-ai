import { api } from './api';

export interface ClinicContextData {
  clinic: { id: string; name: string; email: string; phone: string | null; whatsappPhone: string | null };
  services: { name: string; description: string | null; price: number }[];
  faqs: { question: string; answer: string }[];
  teamMembers: { name: string; role: string }[];
}

export interface OnboardingPayload {
  name?: string;
  whatsappPhone?: string;
  services?: { name: string; description?: string; price: number }[];
  faqs?: { question: string; answer: string }[];
  teamMembers?: { name: string; role: string; email?: string }[];
}

export const salesApi = {
  /** Real Stripe checkout for a new clinic (returns { url }), or 503 in mock mode. */
  checkout: (email: string, name?: string) =>
    api.post<{ url: string }>('/payments/checkout', { email, name }).then((r) => r.data),

  /** Demo activation from the landing — creates clinic + activates, returns onboarding URL. */
  signupActivate: (email: string, name?: string) =>
    api
      .post<{ clinicId: string; onboardingUrl: string }>('/payments/signup-activate', { email, name })
      .then((r) => r.data),

  getContext: (clinicId: string) =>
    api.get<ClinicContextData>(`/clinics/${clinicId}/context`).then((r) => r.data),

  saveOnboarding: (clinicId: string, payload: OnboardingPayload) =>
    api.post<{ ok: boolean }>(`/clinics/${clinicId}/onboarding`, payload).then((r) => r.data),
};
