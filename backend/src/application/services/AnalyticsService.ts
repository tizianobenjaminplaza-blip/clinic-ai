import type { ILeadRepository, LeadMetrics } from '../../domain/repositories/index.js';
import type { Lead } from '../../domain/entities/index.js';

/**
 * AnalyticsService — read-side aggregations for the dashboard: lead metrics,
 * funnel and the recent leads list.
 */
export class AnalyticsService {
  constructor(private readonly leads: ILeadRepository) {}

  async overview(clinicId: string): Promise<LeadMetrics & { funnel: { stage: string; count: number }[] }> {
    const metrics = await this.leads.metrics(clinicId);
    const order = ['NEW', 'ENGAGED', 'QUALIFIED', 'CONVERTED'] as const;
    const funnel = order.map((stage) => ({ stage, count: metrics.byStatus[stage] ?? 0 }));
    return { ...metrics, funnel };
  }

  async recentLeads(clinicId: string, limit = 50): Promise<Lead[]> {
    return this.leads.listByClinic(clinicId, limit);
  }

  async leadDetail(leadId: string) {
    return this.leads.findByIdWithHistory(leadId);
  }
}
