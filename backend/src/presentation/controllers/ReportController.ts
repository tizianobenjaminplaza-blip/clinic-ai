import type { Request, Response } from 'express';
import { z } from 'zod';
import type { ReportService } from '../../application/services/ReportService.js';

const createSchema = z.object({
  // e.g. "2026-05"
  period: z.string().regex(/^\d{4}-\d{2}$/, 'period debe tener formato YYYY-MM'),
});

export class ReportController {
  constructor(private readonly service: ReportService) {}

  /** POST /api/clinics/:clinicId/reports */
  create = async (req: Request, res: Response): Promise<void> => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'period inválido' });
      return;
    }
    const report = await this.service.generateMonthly(req.params.clinicId, parsed.data.period);
    res.status(201).json(report);
  };

  /** GET /api/clinics/:clinicId/reports */
  list = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.service.list(req.params.clinicId));
  };
}
