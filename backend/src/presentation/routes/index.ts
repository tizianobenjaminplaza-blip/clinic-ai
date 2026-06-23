import { Router, json } from 'express';
import { container } from '../../container.js';
import { asyncHandler } from '../../infrastructure/middleware/errorMiddleware.js';

const {
  paymentController, whatsappController, analyticsController,
  abTestingController, reportController, authController, demoController,
  onboardingController,
} = container;

export const router = Router();

// ─── Payments / sales funnel ──────────────────────────────
// Landing → Stripe checkout (new clinic) or demo signup-activate.
router.post('/payments/checkout', json(), asyncHandler(paymentController.createCheckout));
router.post('/payments/signup-activate', json(), asyncHandler(paymentController.signupActivate));
router.post('/payments/demo-activate', json(), asyncHandler(paymentController.demoActivate));
router.get('/clinics/:clinicId/subscription', asyncHandler(paymentController.status));

// ─── Onboarding / personalization ─────────────────────────
router.get('/clinics/:clinicId/context', asyncHandler(onboardingController.get));
router.post('/clinics/:clinicId/onboarding', json(), asyncHandler(onboardingController.save));

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

// ─── Demo (live agent simulator, no Meta) ─────────────────
router.post('/demo/message', json(), asyncHandler(demoController.message));
router.post('/demo/reset',   json(), asyncHandler(demoController.reset));
