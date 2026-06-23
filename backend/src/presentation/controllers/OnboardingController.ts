import type { Request, Response } from 'express';
import { z } from 'zod';
import type { OnboardingService } from '../../application/services/OnboardingService.js';

const contextSchema = z.object({
  name: z.string().min(1).optional(),
  whatsappPhone: z.string().optional(),
  services: z
    .array(z.object({ name: z.string().min(1), description: z.string().optional(), price: z.coerce.number().nonnegative() }))
    .optional(),
  faqs: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) })).optional(),
  teamMembers: z
    .array(z.object({ name: z.string().min(1), role: z.string().min(1), email: z.string().optional() }))
    .optional(),
});

export class OnboardingController {
  constructor(private readonly onboarding: OnboardingService) {}

  /** GET /api/clinics/:clinicId/context → current context for the wizard. */
  get = async (req: Request, res: Response): Promise<void> => {
    const ctx = await this.onboarding.getContext(req.params.clinicId);
    if (!ctx) {
      res.status(404).json({ error: 'Clínica no encontrada' });
      return;
    }
    res.json(ctx);
  };

  /** POST /api/clinics/:clinicId/onboarding → save personalization. */
  save = async (req: Request, res: Response): Promise<void> => {
    const parsed = contextSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() });
      return;
    }
    await this.onboarding.saveContext(req.params.clinicId, parsed.data);
    res.json({ ok: true });
  };
}
