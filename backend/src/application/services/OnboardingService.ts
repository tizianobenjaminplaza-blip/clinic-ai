import type { IClinicRepository, ClinicContextInput } from '../../domain/repositories/index.js';
import type { Clinic } from '../../domain/entities/index.js';

/**
 * OnboardingService — the post-payment, pre-dashboard flow.
 * Creates the clinic from the checkout email and lets the clinic personalize
 * its agent's context (services, FAQs, team, WhatsApp number).
 */
export class OnboardingService {
  constructor(private readonly clinics: IClinicRepository) {}

  /** Find an existing clinic by email or create a fresh one from the sale. */
  async findOrCreateClinic(email: string, name?: string): Promise<Clinic> {
    const existing = await this.clinics.findByEmail(email);
    if (existing) return existing;
    return this.clinics.create({
      name: name?.trim() || email.split('@')[0],
      email: email.toLowerCase().trim(),
    });
  }

  async getContext(clinicId: string) {
    return this.clinics.getContext(clinicId);
  }

  async saveContext(clinicId: string, input: ClinicContextInput): Promise<void> {
    await this.clinics.saveContext(clinicId, input);
  }
}
