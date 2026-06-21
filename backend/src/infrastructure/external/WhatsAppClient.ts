import { env } from '../../config/env.js';

/**
 * Thin wrapper over the Meta WhatsApp Cloud API for sending text messages.
 * Uses the global fetch available in Node 20+.
 */
export class WhatsAppClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = `https://graph.facebook.com/${env.WHATSAPP_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}`;
  }

  async sendText(toPhone: string, body: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: toPhone,
        type: 'text',
        text: { body },
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`WhatsApp send failed (${res.status}): ${detail}`);
    }
  }
}
