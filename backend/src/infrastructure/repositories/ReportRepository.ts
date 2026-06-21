import type { PrismaClient } from '@prisma/client';
import type { IReportRepository } from '../../domain/repositories/index.js';
import type { LeadReport } from '../../domain/entities/index.js';

export class ReportRepository implements IReportRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(clinicId: string, period: string, pdfUrl: string): Promise<LeadReport> {
    return this.prisma.leadReport.create({ data: { clinicId, period, pdfUrl } });
  }

  async listByClinic(clinicId: string): Promise<LeadReport[]> {
    return this.prisma.leadReport.findMany({
      where: { clinicId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
