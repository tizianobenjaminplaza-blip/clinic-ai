import type {
  Clinic,
  ClinicContext,
  Lead,
  LeadInteraction,
  Payment,
  PaymentStatus,
  SenderRole,
  Subscription,
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
}
