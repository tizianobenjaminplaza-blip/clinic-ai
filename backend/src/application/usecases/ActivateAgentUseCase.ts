import type { IPaymentRepository, IClinicRepository } from '../../domain/repositories/index.js';
import type { SubscriptionService } from '../services/SubscriptionService.js';
import type { EmailClient } from '../../infrastructure/external/EmailClient.js';

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

    const clinic = await this.clinics.findById(input.clinicId);
    if (clinic) {
      await this.email.send(
        clinic.email,
        '🎉 Tu agente IA de Clinic AI está activo',
        `<h1>¡Bienvenido, ${clinic.name}!</h1>
         <p>Tu agente IA ya responde por WhatsApp 24/7. Próximos pasos:</p>
         <ol>
           <li>Conecta tu número de WhatsApp Business.</li>
           <li>Carga tus servicios y FAQs en el dashboard.</li>
           <li>Empieza a capturar leads automáticamente.</li>
         </ol>`,
      );
    }

    return { activated: true };
  }
}
