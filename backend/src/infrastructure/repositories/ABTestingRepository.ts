import type { PrismaClient } from '@prisma/client';
import type { IABTestingRepository } from '../../domain/repositories/index.js';
import type { ABTest, ABTestStatus, MessageVariantDraft, VariantResult } from '../../domain/entities/index.js';

type VariantRow = {
  id: string;
  abTestId: string;
  name: string;
  message: string;
  tone: string;
  includesOffer: boolean;
};

function toABTest(row: {
  id: string;
  clinicId: string;
  status: string;
  consentGiven: boolean;
  generatedAt: Date;
  variants: VariantRow[];
}): ABTest {
  return {
    id: row.id,
    clinicId: row.clinicId,
    status: row.status as ABTestStatus,
    consentGiven: row.consentGiven,
    generatedAt: row.generatedAt,
    variants: row.variants.map((v) => ({
      id: v.id,
      abTestId: v.abTestId,
      name: v.name,
      message: v.message,
      tone: v.tone,
      includesOffer: v.includesOffer,
    })),
  };
}

export class ABTestingRepository implements IABTestingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(
    clinicId: string,
    consentGiven: boolean,
    variants: MessageVariantDraft[],
  ): Promise<ABTest> {
    const row = await this.prisma.aBTestingConfig.create({
      data: {
        clinicId,
        consentGiven,
        status: 'RUNNING',
        variants: { create: variants },
      },
      include: { variants: true },
    });
    return toABTest(row);
  }

  async findById(id: string): Promise<ABTest | null> {
    const row = await this.prisma.aBTestingConfig.findUnique({
      where: { id },
      include: { variants: true },
    });
    return row ? toABTest(row) : null;
  }

  async listByClinic(clinicId: string): Promise<ABTest[]> {
    const rows = await this.prisma.aBTestingConfig.findMany({
      where: { clinicId },
      orderBy: { generatedAt: 'desc' },
      include: { variants: true },
    });
    return rows.map(toABTest);
  }

  async recordResult(variantId: string, leadId: string, converted: boolean): Promise<void> {
    await this.prisma.leadABTestResult.create({
      data: { variantId, leadId, sent: true, converted },
    });
  }

  async variantResults(abTestId: string): Promise<VariantResult[]> {
    const variants = await this.prisma.messageVariant.findMany({
      where: { abTestId },
      include: { results: true },
    });
    return variants.map((v) => {
      const sent = v.results.filter((r) => r.sent).length;
      const converted = v.results.filter((r) => r.converted).length;
      return {
        variantId: v.id,
        name: v.name,
        sent,
        converted,
        conversionRate: sent > 0 ? Math.round((converted / sent) * 1000) / 10 : 0,
      };
    });
  }
}
