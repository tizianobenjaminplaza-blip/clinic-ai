import type { PrismaClient } from '@prisma/client';
import type { ISubscriptionRepository } from '../../domain/repositories/index.js';
import type { Subscription, SubscriptionPlan, SubscriptionStatus } from '../../domain/entities/index.js';

function toDomain(row: {
  id: string;
  clinicId: string;
  plan: string;
  status: string;
  isAgentActive: boolean;
  startDate: Date | null;
  endDate: Date | null;
}): Subscription {
  return {
    id: row.id,
    clinicId: row.clinicId,
    plan: row.plan as SubscriptionPlan,
    status: row.status as SubscriptionStatus,
    isAgentActive: row.isAgentActive,
    startDate: row.startDate,
    endDate: row.endDate,
  };
}

export class SubscriptionRepository implements ISubscriptionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByClinicId(clinicId: string): Promise<Subscription | null> {
    const row = await this.prisma.subscription.findUnique({ where: { clinicId } });
    return row ? toDomain(row) : null;
  }

  async activate(clinicId: string): Promise<Subscription> {
    const row = await this.prisma.subscription.upsert({
      where: { clinicId },
      create: {
        clinicId,
        plan: 'PRO',
        status: 'ACTIVE',
        isAgentActive: true,
        startDate: new Date(),
      },
      update: {
        plan: 'PRO',
        status: 'ACTIVE',
        isAgentActive: true,
        startDate: new Date(),
      },
    });
    return toDomain(row);
  }
}
