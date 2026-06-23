import type { IPaymentRepository, IClinicRepository } from '../../domain/repositories/index.js';
import type { SubscriptionService } from '../services/SubscriptionService.js';
import type { EmailClient } from '../../infrastructure/external/EmailClient.js';
import { env } from '../../config/env.js';

// Lazy import keeps socket.io out of the test environment.
async function emit(clinicId: string, event: string, payload: Record<string, unknown>) {
  try {
    const mod = await import('../../infrastructure/websocket/SocketServer.js');
    mod.emitToClinic(clinicId, event as never, payload as never);
  } catch {
    /* socket not critical */
  }
}

interface ActivateAgentInput {
  clinicId: string;
  stripeSessionId: string;
  amount: number;
  currency: string;
}

/**
 * ActivateAgentUseCase — triggered by a successful Stripe payment. It records
 * the payment as PAID, activates the subscription/agent, and emails onboarding.
 * Idempotent: a webhook replay for the same session is a no-op.
 */
export class ActivateAgentUseCase {
  constructor(
    private readonly payments: IPaymentRepository,
    private readonly clinics: IClinicRepository,
    private readonly subscriptions: SubscriptionService,
    private readonly email: EmailClient,
  ) {}

  async execute(input: ActivateAgentInput): Promise<{ activated: boolean }> {
    const existing = await this.payments.findByStripeSessionId(input.stripeSessionId);
    if (existing?.status === 'PAID') {
      return { activated: false }; // already processed
    }

    if (existing) {
      await this.payments.updateStatus(input.stripeSessionId, 'PAID');
    } else {
      await this.payments.create({
        clinicId: input.clinicId,
        stripeSessionId: input.stripeSessionId,
        amount: input.amount,
        currency: input.currency,
        status: 'PAID',
      });
    }

    await this.subscriptions.activate(input.clinicId);
    await emit(input.clinicId, 'payment:activated', { amount: input.amount, currency: input.currency });

    const clinic = await this.clinics.findById(input.clinicId);
    if (clinic) {
      const onboardingUrl = `${env.FRONTEND_URL}/onboarding/${clinic.id}`;
      await this.email.send(
        clinic.email,
        '🎉 Pago recibido — activa y personaliza tu agente IA',
        `<h1>¡Bienvenido, ${clinic.name}!</h1>
         <p>Tu pago se ha recibido correctamente y tu plan PRO ya está activo. 🎉</p>
         <p>Para que tu agente IA empiece a vender por ti, personalízalo en 2 minutos:</p>
         <p style="margin:24px 0">
           <a href="${onboardingUrl}"
              style="background:#10B981;color:#062a1e;padding:12px 22px;border-radius:10px;
                     text-decoration:none;font-weight:600">
             Activar y personalizar mi agente →
           </a>
         </p>
         <p>En ese enlace podrás:</p>
         <ol>
           <li>Conectar tu número de WhatsApp Business.</li>
           <li>Cargar tus servicios y precios.</li>
           <li>Añadir tus preguntas frecuentes y tu equipo.</li>
         </ol>
         <p>En cuanto guardes, tu agente responderá a tus pacientes 24/7 con el contexto de tu clínica.</p>
         <p style="color:#888;font-size:12px">Si el botón no funciona, copia este enlace: ${onboardingUrl}</p>`,
      );
    }

    return { activated: true };
  }
}
