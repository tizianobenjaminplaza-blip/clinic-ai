import type { IClinicRepository } from '../../domain/repositories/index.js';
import type { AgentService } from './AgentService.js';
import type { LeadTrackingService } from './LeadTrackingService.js';
import type { SubscriptionService } from './SubscriptionService.js';
import type { WhatsAppClient } from '../../infrastructure/external/WhatsAppClient.js';

export interface InboundWhatsAppMessage {
  /** WhatsApp Business phone number that received the message (clinic's number). */
  businessPhone: string;
  /** Sender (patient/lead) phone in E.164 without '+'. */
  fromPhone: string;
  /** Sender display name from the WhatsApp profile, if any. */
  profileName?: string;
  /** Text body of the message. */
  text: string;
}

/**
 * WhatsAppService — the 24/7 inbound pipeline:
 *   resolve clinic → check agent active → capture lead → ask Claude → reply → log.
 */
export class WhatsAppService {
  constructor(
    private readonly clinics: IClinicRepository,
    private readonly subscriptions: SubscriptionService,
    private readonly leadTracking: LeadTrackingService,
    private readonly agent: AgentService,
    private readonly whatsapp: WhatsAppClient,
  ) {}

  async handleInbound(msg: InboundWhatsAppMessage): Promise<void> {
    const clinic = await this.clinics.findByWhatsappPhone(msg.businessPhone);
    if (!clinic) {
      console.warn(`[WhatsAppService] No clinic for business phone ${msg.businessPhone}`);
      return;
    }

    if (!(await this.subscriptions.isAgentActive(clinic.id))) {
      console.info(`[WhatsAppService] Agent inactive for clinic ${clinic.id}; ignoring inbound.`);
      return;
    }

    const lead = await this.leadTracking.captureInbound(
      clinic.id,
      msg.fromPhone,
      msg.text,
      msg.profileName,
    );

    const ctx = await this.clinics.getContext(clinic.id);
    if (!ctx) return;

    const history = await this.leadTracking.history(lead.id, 10);
    const reply = await this.agent.generateReply(ctx, history, msg.text);

    await this.whatsapp.sendText(msg.fromPhone, reply);
    await this.leadTracking.recordReply(lead.id, reply, clinic.id);
  }
}
