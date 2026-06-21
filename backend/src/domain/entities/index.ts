// Domain entities — framework-agnostic types used across the application layer.
// These mirror the persistence models but keep the domain decoupled from Prisma.

export type SubscriptionPlan = 'STARTER' | 'PRO' | 'ENTERPRISE';
export type SubscriptionStatus = 'INACTIVE' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type LeadStatus = 'NEW' | 'ENGAGED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';
export type SenderRole = 'LEAD' | 'AGENT';

export interface Clinic {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  whatsappPhone?: string | null;
}

export interface Subscription {
  id: string;
  clinicId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  isAgentActive: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface Payment {
  id: string;
  clinicId: string;
  stripeSessionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
}

export interface Lead {
  id: string;
  clinicId: string;
  phone: string;
  name?: string | null;
  email?: string | null;
  tags: string[];
  status: LeadStatus;
  messageCount: number;
  lastMessageDate?: Date | null;
  inactivityDays: number;
}

export interface LeadInteraction {
  id: string;
  leadId: string;
  senderRole: SenderRole;
  content: string;
  timestamp: Date;
}

export interface ClinicContext {
  clinic: Clinic;
  services: { name: string; description?: string | null; price: number }[];
  faqs: { question: string; answer: string }[];
  teamMembers: { name: string; role: string }[];
}
