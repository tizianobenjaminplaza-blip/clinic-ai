import type { PrismaClient } from '@prisma/client';
import type { IPaymentRepository } from '../../domain/repositories/index.js';
import type { Payment, PaymentStatus } from '../../domain/entities/index.js';

function toDomain(row: {
  id: string;
  clinicId: string;
  stripeSessionId: string;
  amount: unknown;
  currency: string;
  status: string;
}): Payment {
  return {
    id: row.id,
    clinicId: row.clinicId,
    stripeSessionId: row.stripeSessionId,
    amount: Number(row.amount),
    currency: row.currency,
    status: row.status as PaymentStatus,
  };
}

export class PaymentRepository implements IPaymentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: {
    clinicId: string;
    stripeSessionId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
  }): Promise<Payment> {
    const row = await this.prisma.payment.create({ data });
    return toDomain(row);
  }

  async findByStripeSessionId(stripeSessionId: string): Promise<Payment | null> {
    const row = await this.prisma.payment.findUnique({ where: { stripeSessionId } });
    return row ? toDomain(row) : null;
  }

  async updateStatus(stripeSessionId: string, status: PaymentStatus): Promise<Payment> {
    const row = await this.prisma.payment.update({
      where: { stripeSessionId },
      data: { status },
    });
    return toDomain(row);
  }
}
