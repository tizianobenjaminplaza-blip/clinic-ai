import type { Request, Response } from 'express';
import { z } from 'zod';
import type { ABTestingService } from '../../application/services/ABTestingService.js';

const createSchema = z.object({
  consentGiven: z.boolean(),
  variantCount: z.number().int().min(2).max(5).optional(),
});

const outcomeSchema = z.object({
  variantId: z.string().min(1),
  leadId: z.string().min(1),
  converted: z.boolean(),
});

export class ABTestingController {
  constructor(private readonly service: ABTestingService) {}

  /** POST /api/clinics/:clinicId/ab-tests */
  create = async (req: Request, res: Response): Promise<void> => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'consentGiven es requerido (boolean)' });
      return;
    }
    const test = await this.service.createTest(
      req.params.clinicId,
      parsed.data.consentGiven,
      parsed.data.variantCount,
    );
    res.status(201).json(test);
  };

  /** GET /api/clinics/:clinicId/ab-tests */
  list = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.service.list(req.params.clinicId));
  };

  /** GET /api/ab-tests/:id/results */
  results = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.service.results(req.params.id));
  };

  /** POST /api/ab-tests/outcome */
  recordOutcome = async (req: Request, res: Response): Promise<void> => {
    const parsed = outcomeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'variantId, leadId y converted son requeridos' });
      return;
    }
    await this.service.recordOutcome(parsed.data.variantId, parsed.data.leadId, parsed.data.converted);
    res.status(204).send();
  };
}
