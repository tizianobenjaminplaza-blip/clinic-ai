import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { router } from './presentation/routes/index.js';
import { errorMiddleware } from './infrastructure/middleware/errorMiddleware.js';

export function createApp(): express.Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));

  // Stripe webhook MUST receive the raw body for signature verification.
  // This is mounted before any JSON body parser touches the path.
  app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'clinic-ai-backend' });
  });

  app.use('/api', router);

  app.use(errorMiddleware);

  return app;
}
