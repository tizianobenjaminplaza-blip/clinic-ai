import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  APP_BASE_URL: z.string().url().default('http://localhost:4000'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),

  DATABASE_URL: z.string().min(1),

  // External keys are optional in dev so the app can boot in mock mode for
  // free local testing. In production these should always be set.
  STRIPE_SECRET_KEY: z.string().default('sk_test_placeholder'),
  STRIPE_WEBHOOK_SECRET: z.string().default('whsec_placeholder'),
  STRIPE_PRICE_ID: z.string().default('price_placeholder'),
  STRIPE_SUCCESS_URL: z.string().url().default('http://localhost:3000/dashboard?payment=success'),
  STRIPE_CANCEL_URL: z.string().url().default('http://localhost:3000/dashboard?payment=cancel'),

  ANTHROPIC_API_KEY: z.string().default(''),
  ANTHROPIC_MODEL: z.string().default('claude-opus-4-8'),

  WHATSAPP_VERIFY_TOKEN: z.string().default('dev_verify_token'),
  WHATSAPP_ACCESS_TOKEN: z.string().default('dev_access_token'),
  WHATSAPP_PHONE_NUMBER_ID: z.string().default('dev_phone_id'),
  WHATSAPP_API_VERSION: z.string().default('v21.0'),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default('Clinic AI <noreply@clinic-ai.com>'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration');
}

export const env = parsed.data;
export type Env = typeof env;
