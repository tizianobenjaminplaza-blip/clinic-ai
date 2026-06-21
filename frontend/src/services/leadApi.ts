import { api } from './api';
import type { Lead } from './api';

export interface Interaction {
  id: string;
  leadId: string;
  senderRole: 'LEAD' | 'AGENT';
  content: string;
  timestamp: string;
}

export interface LeadWithHistory extends Lead {
  interactions: Interaction[];
}

export const leadDetailApi = {
  get: (leadId: string) =>
    api.get<LeadWithHistory>(`/leads/${leadId}`).then((r) => r.data),
};
