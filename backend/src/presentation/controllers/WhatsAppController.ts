import type { Request, Response } from 'express';
import { env } from '../../config/env.js';
import type { WhatsAppService, InboundWhatsAppMessage } from '../../application/services/WhatsAppService.js';

export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  /** GET /api/whatsapp/webhook → Meta verification handshake. */
  verify = (req: Request, res: Response): void => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === env.WHATSAPP_VERIFY_TOKEN) {
      res.status(200).send(challenge);
      return;
    }
    res.sendStatus(403);
  };

  /** POST /api/whatsapp/webhook → inbound messages. Ack fast, process async. */
  receive = (req: Request, res: Response): void => {
    // Acknowledge immediately so Meta doesn't retry; processing is fire-and-forget.
    res.sendStatus(200);

    const messages = this.extractMessages(req.body);
    for (const msg of messages) {
      this.whatsappService.handleInbound(msg).catch((err) => {
        console.error('[WhatsAppController] handleInbound failed:', err);
      });
    }
  };

  private extractMessages(body: unknown): InboundWhatsAppMessage[] {
    const out: InboundWhatsAppMessage[] = [];
    const entries = (body as { entry?: unknown[] })?.entry ?? [];

    for (const entry of entries as Array<{ changes?: unknown[] }>) {
      for (const change of entry.changes ?? []) {
        const value = (change as { value?: Record<string, any> }).value;
        if (!value?.messages) continue;

        const businessPhone = value.metadata?.display_phone_number ?? '';
        const contacts = value.contacts ?? [];

        for (const message of value.messages) {
          if (message.type !== 'text') continue;
          const profileName = contacts.find((c: any) => c.wa_id === message.from)?.profile?.name;
          out.push({
            businessPhone,
            fromPhone: message.from,
            profileName,
            text: message.text?.body ?? '',
          });
        }
      }
    }
    return out;
  }
}
