import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';

/**
 * Email sender used for onboarding and reports.
 * Falls back to a no-op console logger when SMTP is not configured (dev).
 */
export class EmailClient {
  private readonly transporter: nodemailer.Transporter | null;

  constructor() {
    if (env.SMTP_HOST && env.SMTP_PORT) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
      });
    } else {
      this.transporter = null;
    }
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) {
      console.info(`[EmailClient] (no SMTP configured) → would send "${subject}" to ${to}`);
      return;
    }
    await this.transporter.sendMail({ from: env.EMAIL_FROM, to, subject, html });
  }
}
