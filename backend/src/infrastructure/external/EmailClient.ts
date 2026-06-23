import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';

/**
 * Email sender used for onboarding and reports.
 * Falls back to a no-op console logger when SMTP is not configured (dev).
 */
export class EmailClient {
  private readonly transporter: nodemailer.Transporter | null;

  constructor() {
    // Treat placeholder credentials as "not configured" so local/demo runs
    // log emails instead of trying (and failing) to authenticate against SMTP.
    const isPlaceholder = (v?: string) =>
      !v || v.includes('REEMPLAZA') || v.includes('placeholder');
    const configured =
      !!env.SMTP_HOST && !!env.SMTP_PORT && !isPlaceholder(env.SMTP_PASS);

    if (configured) {
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
