import type { Request, Response } from 'express';
import type Stripe from 'stripe';
import { z } from 'zod';
import { stripe } from '../../infrastructure/external/StripeClient.js';
import { env } from '../../config/env.js';
import type { ActivateAgentUseCase } from '../../application/usecases/ActivateAgentUseCase.js';
import type { SubscriptionService } from '../../application/services/SubscriptionService.js';
import type { OnboardingService } from '../../application/services/OnboardingService.js';

const signupSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
});
const clinicIdSchema = z.object({ clinicId: z.string().min(1) });

/** True when Stripe keys are still placeholders (local/demo, no real billing). */
const stripeMockMode =
  !env.STRIPE_SECRET_KEY ||
  env.STRIPE_SECRET_KEY.includes('placeholder') ||
  env.STRIPE_SECRET_KEY.includes('REEMPLAZA');

export class PaymentController {
  constructor(
    private readonly activateAgent: ActivateAgentUseCase,
    private readonly subscriptions: SubscriptionService,
    private readonly onboarding: OnboardingService,
  ) {}

  /** GET /api/clinics/:clinicId/subscription → current plan/agent status. */
  status = async (req: Request, res: Response): Promise<void> => {
    const sub = await this.subscriptions.status(req.params.clinicId);
    res.json({
      plan: sub?.plan ?? 'NONE',
      status: sub?.status ?? 'INACTIVE',
      isAgentActive: !!sub?.isAgentActive && sub?.status === 'ACTIVE',
      startDate: sub?.startDate ?? null,
      stripeMockMode,
    });
  };

  /**
   * POST /api/payments/checkout → Stripe Checkout for a NEW clinic from the
   * landing page. Stripe collects/uses the clinic email; the webhook then
   * creates the clinic and activates it.
   */
  createCheckout = async (req: Request, res: Response): Promise<void> => {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Se requiere un email válido' });
      return;
    }

    if (stripeMockMode) {
      res.status(503).json({
        error: 'Stripe no está configurado. Usa la activación de demostración.',
        stripeMockMode: true,
      });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: env.STRIPE_SUCCESS_URL,
      cancel_url: env.STRIPE_CANCEL_URL,
      customer_email: parsed.data.email,
      metadata: { email: parsed.data.email, name: parsed.data.name ?? '' },
    });

    res.status(201).json({ url: session.url, sessionId: session.id });
  };

  /**
   * POST /api/payments/webhook → Stripe events.
   * Requires the raw request body (configured in the route) for signature checks.
   */
  handleWebhook = async (req: Request, res: Response): Promise<void> => {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
      res.status(400).send('Missing stripe-signature header');
      return;
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body as Buffer,
        signature,
        env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      res.status(400).send(`Webhook signature verification failed: ${(err as Error).message}`);
      return;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const email =
        session.customer_details?.email ?? session.customer_email ?? session.metadata?.email;
      if (email) {
        // Create the clinic from the sale, then activate + email onboarding link.
        const clinic = await this.onboarding.findOrCreateClinic(email, session.metadata?.name);
        await this.activateAgent.execute({
          clinicId: clinic.id,
          stripeSessionId: session.id,
          amount: (session.amount_total ?? 0) / 100,
          currency: session.currency ?? 'eur',
        });
      }
    }

    res.json({ received: true });
  };

  /**
   * POST /api/payments/signup-activate → landing-page activation in demo mode.
   * Creates the clinic from email, activates it, and returns the onboarding URL.
   * Disabled in production (real payments must go through Stripe).
   */
  signupActivate = async (req: Request, res: Response): Promise<void> => {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Se requiere un email válido' });
      return;
    }
    if (!stripeMockMode) {
      res.status(403).json({ error: 'La activación de demostración está deshabilitada en producción.' });
      return;
    }

    const clinic = await this.onboarding.findOrCreateClinic(parsed.data.email, parsed.data.name);
    await this.activateAgent.execute({
      clinicId: clinic.id,
      stripeSessionId: `demo_${Date.now()}`,
      amount: 149,
      currency: 'eur',
    });

    res.json({
      clinicId: clinic.id,
      onboardingUrl: `/onboarding/${clinic.id}`,
    });
  };

  /**
   * POST /api/payments/demo-activate → re-activate an EXISTING clinic from the
   * dashboard billing page (demo mode only).
   */
  demoActivate = async (req: Request, res: Response): Promise<void> => {
    const parsed = clinicIdSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'clinicId is required' });
      return;
    }
    if (!stripeMockMode) {
      res.status(403).json({ error: 'La activación de demostración está deshabilitada en producción.' });
      return;
    }

    const result = await this.activateAgent.execute({
      clinicId: parsed.data.clinicId,
      stripeSessionId: `demo_${Date.now()}`,
      amount: 149,
      currency: 'eur',
    });
    res.json({ activated: result.activated, plan: 'PRO' });
  };
}
