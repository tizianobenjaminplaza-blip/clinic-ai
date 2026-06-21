import type { ILeadRepository } from '../../domain/repositories/index.js';
import type { Lead, LeadInteraction, SenderRole } from '../../domain/entities/index.js';
// Lazy import to avoid socket.io being loaded in test environments.
let _emit: typeof import('../../infrastructure/websocket/SocketServer.js').emitToClinic | null = null;
async function getEmit() {
  if (!_emit) {
    const mod = await import('../../infrastructure/websocket/SocketServer.js');
    _emit = mod.emitToClinic;
  }
  return _emit;
}

/**
 * LeadTrackingService — captures every inbound/outbound message as a lead
 * interaction and promotes leads from NEW → ENGAGED once they reply more
 * than once. Scoring/tagging hooks live here too (extension point).
 */
export class LeadTrackingService {
  constructor(private readonly leads: ILeadRepository) {}

  async captureInbound(clinicId: string, phone: string, content: string, name?: string): Promise<Lead> {
    const isNew = !(await this.leads.findByClinicAndPhone(clinicId, phone));
    const lead = await this.leads.upsertFromMessage(clinicId, phone, name);
    await this.leads.addInteraction(lead.id, 'LEAD', content);

    getEmit().then((emit) => {
      if (isNew) emit(clinicId, 'lead:new', { id: lead.id, phone: lead.phone, name: lead.name });
      emit(clinicId, 'message:in', { leadId: lead.id, text: content });
    }).catch(() => {/* socket not critical */});

    if (lead.messageCount >= 2 && lead.status === 'NEW') {
      await this.leads.markEngaged(lead.id);
      getEmit().then((emit) => emit(clinicId, 'lead:engaged', { id: lead.id })).catch(() => {});
    }
    return lead;
  }

  async recordReply(leadId: string, content: string, clinicId?: string): Promise<void> {
    await this.leads.addInteraction(leadId, 'AGENT', content);
    if (clinicId) {
      getEmit().then((emit) => emit(clinicId, 'message:out', { leadId, text: content })).catch(() => {});
    }
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
