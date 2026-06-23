import type { PrismaClient } from '@prisma/client';
import type { ILeadRepository, LeadMetrics } from '../../domain/repositories/index.js';
import type { Lead, LeadInteraction, LeadStatus, SenderRole } from '../../domain/entities/index.js';

function toLead(row: {
  id: string;
  clinicId: string;
  phone: string;
  name: string | null;
  email: string | null;
  tags: string[];
  status: string;
  messageCount: number;
  lastMessageDate: Date | null;
  inactivityDays: number;
}): Lead {
  return {
    id: row.id,
    clinicId: row.clinicId,
    phone: row.phone,
    name: row.name,
    email: row.email,
    tags: row.tags,
    status: row.status as LeadStatus,
    messageCount: row.messageCount,
    lastMessageDate: row.lastMessageDate,
    inactivityDays: row.inactivityDays,
  };
}

export class LeadRepository implements ILeadRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByClinicAndPhone(clinicId: string, phone: string): Promise<Lead | null> {
    const row = await this.prisma.lead.findUnique({
      where: { clinicId_phone: { clinicId, phone } },
    });
    return row ? toLead(row) : null;
  }

  async upsertFromMessage(clinicId: string, phone: string, name?: string): Promise<Lead> {
    const row = await this.prisma.lead.upsert({
      where: { clinicId_phone: { clinicId, phone } },
      create: {
        clinicId,
        phone,
        name: name ?? null,
        status: 'NEW',
        messageCount: 1,
        lastMessageDate: new Date(),
      },
      update: {
        name: name ?? undefined,
        messageCount: { increment: 1 },
        lastMessageDate: new Date(),
        inactivityDays: 0,
      },
    });
    return toLead(row);
  }

  async addInteraction(
    leadId: string,
    senderRole: SenderRole,
    content: string,
  ): Promise<LeadInteraction> {
    const row = await this.prisma.leadInteraction.create({
      data: { leadId, senderRole, content },
    });
    return {
      id: row.id,
      leadId: row.leadId,
      senderRole: row.senderRole as SenderRole,
      content: row.content,
      timestamp: row.timestamp,
    };
  }

  async recentInteractions(leadId: string, limit: number): Promise<LeadInteraction[]> {
    const rows = await this.prisma.leadInteraction.findMany({
      where: { leadId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
    return rows
      .map((r) => ({
        id: r.id,
        leadId: r.leadId,
        senderRole: r.senderRole as SenderRole,
        content: r.content,
        timestamp: r.timestamp,
      }))
      .reverse();
  }

  async markEngaged(leadId: string): Promise<void> {
    await this.prisma.lead.update({
      where: { id: leadId },
      data: { status: 'ENGAGED' },
    });
  }

  async listByClinic(clinicId: string, limit: number): Promise<Lead[]> {
    const rows = await this.prisma.lead.findMany({
      where: { clinicId },
      orderBy: { lastMessageDate: 'desc' },
      take: limit,
    });
    return rows.map(toLead);
  }

  async deleteByClinicAndPhone(clinicId: string, phone: string): Promise<void> {
    const lead = await this.prisma.lead.findUnique({
      where: { clinicId_phone: { clinicId, phone } },
      select: { id: true },
    });
    if (!lead) return;
    await this.prisma.leadInteraction.deleteMany({ where: { leadId: lead.id } });
    await this.prisma.lead.delete({ where: { id: lead.id } });
  }

  async findByIdWithHistory(leadId: string) {
    const row = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: { interactions: { orderBy: { timestamp: 'asc' } } },
    });
    if (!row) return null;
    return {
      ...toLead(row),
      interactions: row.interactions.map((i) => ({
        id: i.id,
        leadId: i.leadId,
        senderRole: i.senderRole as 'LEAD' | 'AGENT',
        content: i.content,
        timestamp: i.timestamp,
      })),
    };
  }

  async metrics(clinicId: string): Promise<LeadMetrics> {
    const [leads, grouped, totalMessages] = await Promise.all([
      this.prisma.lead.findMany({
        where: { clinicId },
        select: { status: true, createdAt: true },
      }),
      this.prisma.lead.groupBy({
        by: ['status'],
        where: { clinicId },
        _count: { _all: true },
      }),
      this.prisma.leadInteraction.count({ where: { lead: { clinicId } } }),
    ]);

    const byStatus: Record<string, number> = {};
    for (const g of grouped) byStatus[g.status] = g._count._all;

    const totalLeads = leads.length;
    const converted = byStatus['CONVERTED'] ?? 0;
    const conversionRate = totalLeads > 0 ? Math.round((converted / totalLeads) * 1000) / 10 : 0;

    // Build last-14-day daily new-lead series.
    const days = 14;
    const series = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      series.set(d.toISOString().slice(0, 10), 0);
    }
    for (const l of leads) {
      const key = l.createdAt.toISOString().slice(0, 10);
      if (series.has(key)) series.set(key, (series.get(key) ?? 0) + 1);
    }
    const leadsOverTime = [...series.entries()].map(([date, count]) => ({ date, count }));

    return { totalLeads, byStatus, conversionRate, totalMessages, leadsOverTime };
  }
}
