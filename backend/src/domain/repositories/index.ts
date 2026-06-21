import type {
  ABTest,
  Clinic,
  ClinicContext,
  Lead,
  LeadInteraction,
  LeadReport,
  MessageVariantDraft,
  Payment,
  PaymentStatus,
  SenderRole,
  Subscription,
  VariantResult,
} from '../entities/index.js';

export interface IClinicRepository {
  findById(id: string): Promise<Clinic | null>;
  findByWhatsappPhone(whatsappPhone: string): Promise<Clinic | null>;
  getContext(clinicId: string): Promise<ClinicContext | null>;
}

export interface IPaymentRepository {
  create(data: {
    clinicId: string;
    stripeSessionId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
  }): Promise<Payment>;
  findByStripeSessionId(stripeSessionId: string): Promise<Payment | null>;
  updateStatus(stripeSessionId: string, status: PaymentStatus): Promise<Payment>;
}

export interface ISubscriptionRepository {
  findByClinicId(clinicId: string): Promise<Subscription | null>;
  activate(clinicId: string): Promise<Subscription>;
}

export interface LeadMetrics {
  totalLeads: number;
  byStatus: Record<string, number>;
  conversionRate: number;
  totalMessages: number;
  /** Daily new-lead counts for the last 14 days, oldest first. */
  leadsOverTime: { date: string; count: number }[];
}

export interface ILeadRepository {
  findByClinicAndPhone(clinicId: string, phone: string): Promise<Lead | null>;
  upsertFromMessage(clinicId: string, phone: string, name?: string): Promise<Lead>;
  addInteraction(
    leadId: string,
    senderRole: SenderRole,
    content: string,
  ): Promise<LeadInteraction>;
  recentInteractions(leadId: string, limit: number): Promise<LeadInteraction[]>;
  markEngaged(leadId: string): Promise<void>;
  listByClinic(clinicId: string, limit: number): Promise<Lead[]>;
  metrics(clinicId: string): Promise<LeadMetrics>;
}

export interface IABTestingRepository {
  create(clinicId: string, consentGiven: boolean, variants: MessageVariantDraft[]): Promise<ABTest>;
  findById(id: string): Promise<ABTest | null>;
  listByClinic(clinicId: string): Promise<ABTest[]>;
  recordResult(variantId: string, leadId: string, converted: boolean): Promise<void>;
  variantResults(abTestId: string): Promise<VariantResult[]>;
}

export interface IReportRepository {
  create(clinicId: string, period: string, pdfUrl: string): Promise<LeadReport>;
  listByClinic(clinicId: string): Promise<LeadReport[]>;
}
