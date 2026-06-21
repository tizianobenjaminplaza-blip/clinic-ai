import type { ILeadRepository } from '../../domain/repositories/index.js';
import type { Lead, LeadInteraction, SenderRole } from '../../domain/entities/index.js';

/**
 * LeadTrackingService — captures every inbound/outbound message as a lead
 * interaction and promotes leads from NEW → ENGAGED once they reply more
 * than once. Scoring/tagging hooks live here too (extension point).
 */
export class LeadTrackingService {
  constructor(private readonly leads: ILeadRepository) {}

  async captureInbound(clinicId: string, phone: string, content: string, name?: string): Promise<Lead> {
    const lead = await this.leads.upsertFromMessage(clinicId, phone, name);
    await this.leads.addInteraction(lead.id, 'LEAD', content);
    if (lead.messageCount >= 2 && lead.status === 'NEW') {
      await this.leads.markEngaged(lead.id);
    }
    return lead;
  }

  async recordReply(leadId: string, content: string): Promise<void> {
    await this.leads.addInteraction(leadId, 'AGENT', content);
  }

  async history(leadId: string, limit = 10): Promise<LeadInteraction[]> {
    return this.leads.recentInteractions(leadId, limit);
  }

  /** Simple heuristic engagement score (0-100) — extension point for ML scoring. */
  scoreEngagement(messageCount: number, role: SenderRole = 'LEAD'): number {
    const base = Math.min(messageCount * 12, 90);
    return role === 'LEAD' ? base : Math.max(base - 10, 0);
  }
}
