import type { PrismaClient } from '@prisma/client';
import type { IClinicRepository } from '../../domain/repositories/index.js';
import type { Clinic, ClinicContext } from '../../domain/entities/index.js';

export class ClinicRepository implements IClinicRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Clinic | null> {
    return this.prisma.clinic.findUnique({ where: { id } });
  }

  async findByWhatsappPhone(whatsappPhone: string): Promise<Clinic | null> {
    return this.prisma.clinic.findUnique({ where: { whatsappPhone } });
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
