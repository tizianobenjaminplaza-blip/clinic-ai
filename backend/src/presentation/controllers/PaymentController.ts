import type { Request, Response } from 'express';
import type Stripe from 'stripe';
import { z } from 'zod';
import { stripe } from '../../infrastructure/external/StripeClient.js';
import { env } from '../../config/env.js';
import type { ActivateAgentUseCase } from '../../application/usecases/ActivateAgentUseCase.js';

const checkoutSchema = z.object({
  clinicId: z.string().min(1),
});

export class PaymentController {
  constructor(private readonly activateAgent: ActivateAgentUseCase) {}

  /** POST /api/payments/checkout → creates a Stripe Checkout session. */
  createCheckout = async (req: Request, res: Response): Promise<void> => {
    const parsed = checkoutSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'clinicId is required' });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: env.STRIPE_SUCCESS_URL,
      cancel_url: env.STRIPE_CANCEL_URL,
      client_reference_id: parsed.data.clinicId,
      metadata: { clinicId: parsed.data.clinicId },
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
      const clinicId = session.metadata?.clinicId ?? session.client_reference_id;
      if (clinicId) {
        await this.activateAgent.execute({
          clinicId,
          stripeSessionId: session.id,
          amount: (session.amount_total ?? 0) / 100,
          currency: session.currency ?? 'usd',
        });
      }
    }

    res.json({ received: true });
  };
}
