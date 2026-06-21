import { Router, json } from 'express';
import { container } from '../../container.js';
import { asyncHandler } from '../../infrastructure/middleware/errorMiddleware.js';

const {
  paymentController, whatsappController, analyticsController,
  abTestingController, reportController, authController,
} = container;

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

// ─── A/B testing ──────────────────────────────────────────
router.post('/clinics/:clinicId/ab-tests', json(), asyncHandler(abTestingController.create));
router.get('/clinics/:clinicId/ab-tests', asyncHandler(abTestingController.list));
router.get('/ab-tests/:id/results', asyncHandler(abTestingController.results));
router.post('/ab-tests/outcome', json(), asyncHandler(abTestingController.recordOutcome));

// ─── Reports ──────────────────────────────────────────────
router.post('/clinics/:clinicId/reports', json(), asyncHandler(reportController.create));
router.get('/clinics/:clinicId/reports', asyncHandler(reportController.list));

// ─── Lead detail ──────────────────────────────────────────
router.get('/leads/:leadId', asyncHandler(analyticsController.leadDetail));

// ─── Auth / 2FA ───────────────────────────────────────────
router.post('/auth/2fa/send',   json(), asyncHandler(authController.sendCode));
router.post('/auth/2fa/verify', json(), authController.verifyCode);
