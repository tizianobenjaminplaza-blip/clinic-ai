import type { PrismaClient } from '@prisma/client';
import type { IClinicRepository, ClinicContextInput } from '../../domain/repositories/index.js';
import type { Clinic, ClinicContext } from '../../domain/entities/index.js';

export class ClinicRepository implements IClinicRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Clinic | null> {
    return this.prisma.clinic.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<Clinic | null> {
    return this.prisma.clinic.findUnique({ where: { email } });
  }

  async findByWhatsappPhone(whatsappPhone: string): Promise<Clinic | null> {
    return this.prisma.clinic.findUnique({ where: { whatsappPhone } });
  }

  async create(data: { name: string; email: string; phone?: string; whatsappPhone?: string }): Promise<Clinic> {
    return this.prisma.clinic.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone ?? null,
        whatsappPhone: data.whatsappPhone ?? null,
      },
    });
  }

  async saveContext(clinicId: string, input: ClinicContextInput): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      if (input.name !== undefined || input.whatsappPhone !== undefined) {
        await tx.clinic.update({
          where: { id: clinicId },
          data: {
            ...(input.name !== undefined ? { name: input.name } : {}),
            ...(input.whatsappPhone !== undefined ? { whatsappPhone: input.whatsappPhone || null } : {}),
          },
        });
      }
      if (input.services) {
        await tx.service.deleteMany({ where: { clinicId } });
        if (input.services.length)
          await tx.service.createMany({
            data: input.services.map((s) => ({
              clinicId,
              name: s.name,
              description: s.description ?? null,
              price: s.price,
            })),
          });
      }
      if (input.faqs) {
        await tx.fAQ.deleteMany({ where: { clinicId } });
        if (input.faqs.length)
          await tx.fAQ.createMany({
            data: input.faqs.map((f) => ({ clinicId, question: f.question, answer: f.answer })),
          });
      }
      if (input.teamMembers) {
        await tx.teamMember.deleteMany({ where: { clinicId } });
        if (input.teamMembers.length)
          await tx.teamMember.createMany({
            data: input.teamMembers.map((t) => ({
              clinicId,
              name: t.name,
              role: t.role,
              email: t.email ?? '',
            })),
          });
      }
    });
  }

  async getContext(clinicId: string): Promise<ClinicContext | null> {
    const clinic = await this.prisma.clinic.findUnique({
      where: { id: clinicId },
      include: { services: true, faqs: true, teamMembers: true },
    });
    if (!clinic) return null;

    return {
      clinic: {
        id: clinic.id,
        name: clinic.name,
        email: clinic.email,
        phone: clinic.phone,
        whatsappPhone: clinic.whatsappPhone,
      },
      services: clinic.services.map((s) => ({
        name: s.name,
        description: s.description,
        price: Number(s.price),
      })),
      faqs: clinic.faqs.map((f) => ({ question: f.question, answer: f.answer })),
      teamMembers: clinic.teamMembers.map((t) => ({ name: t.name, role: t.role })),
    };
  }
}
