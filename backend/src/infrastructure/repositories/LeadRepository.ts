import type { PrismaClient } from '@prisma/client';
import type { ILeadRepository } from '../../domain/repositories/index.js';
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
}
