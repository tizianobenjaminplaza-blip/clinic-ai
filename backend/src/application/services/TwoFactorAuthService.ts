import { otpStore } from '../../infrastructure/external/OTPStore.js';
import type { EmailClient } from '../../infrastructure/external/EmailClient.js';

/**
 * TwoFactorAuthService — email-based OTP (6-digit, 5-minute TTL).
 *
 * Flow:
 *   POST /api/auth/2fa/send   → generates code, emails it
 *   POST /api/auth/2fa/verify → validates code, returns session token
 *
 * Production upgrade path: swap email delivery for SMS (Twilio/SNS) and
 * the OTP store for Redis — the service interface stays the same.
 */
export class TwoFactorAuthService {
  constructor(private readonly email: EmailClient) {}

  async sendCode(userEmail: string, userName?: string): Promise<void> {
    // Generate a 6-digit numeric code (not TOTP — stateless token approach)
    const code = String(Math.floor(100000 + Math.random() * 900000));
    otpStore.set(userEmail, code);

    await this.email.send(
      userEmail,
      '🔐 Tu código de verificación — Clinic AI',
      `<p>Hola${userName ? ` ${userName}` : ''},</p>
       <p>Tu código de acceso de un solo uso es:</p>
       <h2 style="letter-spacing:8px;font-size:36px;color:#1d4ed8">${code}</h2>
       <p>Válido por <strong>5 minutos</strong>. No lo compartas con nadie.</p>
       <p style="font-size:12px;color:#94a3b8">Si no solicitaste este código, ignora este mensaje.</p>`,
    );
  }

  verifyCode(userEmail: string, code: string): { valid: boolean; reason?: string } {
    const result = otpStore.verify(userEmail, code);
    switch (result) {
      case 'ok':           return { valid: true };
      case 'expired':      return { valid: false, reason: 'El código ha expirado. Solicita uno nuevo.' };
      case 'invalid':      return { valid: false, reason: 'Código incorrecto.' };
      case 'max_attempts': return { valid: false, reason: 'Demasiados intentos. Solicita un nuevo código.' };
    }
  }
}
