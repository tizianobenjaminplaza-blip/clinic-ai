import { Router, json } from 'express';
import { container } from '../../container.js';
import { asyncHandler } from '../../infrastructure/middleware/errorMiddleware.js';

const { paymentController, whatsappController, analyticsController } = container;

export const router = Router();

// ─── Payments ─────────────────────────────────────────────
// JSON body for checkout.
router.post('/payments/checkout', json(), asyncHandler(paymentController.createCheckout));

// Stripe webhook needs the RAW body for signature verification — note express.raw().
router.post(
  '/payments/webhook',
  // raw applied at app level for this path; handler reads req.body as Buffer
  asyncHandler(paymentController.handleWebhook),
);

// ─── WhatsApp ─────────────────────────────────────────────
router.get('/whatsapp/webhook', whatsappController.verify);
router.post('/whatsapp/webhook', json(), whatsappController.receive);

// ─── Analytics / dashboard reads ──────────────────────────
router.get('/clinics/:clinicId/metrics', asyncHandler(analyticsController.overview));
router.get('/clinics/:clinicId/leads', asyncHandler(analyticsController.leads));
