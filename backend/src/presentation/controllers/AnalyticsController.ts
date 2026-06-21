import type { Request, Response } from 'express';
import type { AnalyticsService } from '../../application/services/AnalyticsService.js';

export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  /** GET /api/clinics/:clinicId/metrics */
  overview = async (req: Request, res: Response): Promise<void> => {
    const data = await this.analytics.overview(req.params.clinicId);
    res.json(data);
  };

  /** GET /api/clinics/:clinicId/leads */
  leads = async (req: Request, res: Response): Promise<void> => {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const data = await this.analytics.recentLeads(req.params.clinicId, limit);
    res.json(data);
  };
}
