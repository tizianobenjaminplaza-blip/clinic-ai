import type { Request, Response } from 'express';
import type { IClinicRepository } from '../../domain/repositories/index.js';
import type { AgentService } from '../../application/services/AgentService.js';
import type { LeadTrackingService } from '../../application/services/LeadTrackingService.js';

/**
 * DemoController — runs the full inbound agent pipeline WITHOUT Meta/WhatsApp,
 * so the product can be demoed live: capture lead → ask agent → return reply.
 * Same services as the real WhatsApp flow, just returns the answer instead of
 * sending it over the wire.
 */
export class DemoController {
  constructor(
    private readonly clinics: IClinicRepository,
    private readonly leadTracking: LeadTrackingService,
    private readonly agent: AgentService,
  ) {}

  /** POST /api/demo/message  { clinicId, phone, name?, text } */
  message = async (req: Request, res: Response): Promise<void> => {
    const { clinicId, phone, name, text } = req.body ?? {};
    if (!clinicId || !phone || !text) {
      res.status(400).json({ error: 'clinicId, phone y text son obligatorios' });
      return;
    }

    const ctx = await this.clinics.getContext(clinicId);
    if (!ctx) {
      res.status(404).json({ error: 'Clínica no encontrada' });
      return;
    }

    const lead = await this.leadTracking.captureInbound(clinicId, phone, text, name);
    const history = await this.leadTracking.history(lead.id, 10);
    const reply = await this.agent.generateReply(ctx, history, text);
    await this.leadTracking.recordReply(lead.id, reply, clinicId);

    res.json({
      reply,
      lead: {
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        status: lead.status,
        messageCount: lead.messageCount,
      },
    });
  };

  /** POST /api/demo/reset  { clinicId, phone } — clears a demo lead's history */
  reset = async (req: Request, res: Response): Promise<void> => {
    const { clinicId, phone } = req.body ?? {};
    if (!clinicId || !phone) {
      res.status(400).json({ error: 'clinicId y phone son obligatorios' });
      return;
    }
    await this.leadTracking.resetLead(clinicId, phone);
    res.json({ ok: true });
  };
}
