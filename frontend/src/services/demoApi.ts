import { api } from './api';

export interface DemoLead {
  id: string;
  name: string | null;
  phone: string;
  status: 'NEW' | 'ENGAGED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';
  messageCount: number;
}

export interface DemoResponse {
  reply: string;
  lead: DemoLead;
}

export const demoApi = {
  send: (clinicId: string, phone: string, text: string, name?: string) =>
    api
      .post<DemoResponse>('/demo/message', { clinicId, phone, text, name })
      .then((r) => r.data),

  reset: (clinicId: string, phone: string) =>
    api.post('/demo/reset', { clinicId, phone }).then((r) => r.data),
};
