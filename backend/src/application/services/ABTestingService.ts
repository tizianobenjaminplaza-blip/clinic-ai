import type { IABTestingRepository, IClinicRepository } from '../../domain/repositories/index.js';
import type { ABTest, VariantResult } from '../../domain/entities/index.js';
import type { AgentService } from './AgentService.js';
import { AppError } from '../../infrastructure/middleware/errorMiddleware.js';

/**
 * ABTestingService — generates message variants via Claude and tracks which
 * convert. GDPR/CCPA: variants are only generated when explicit consent is
 * given (the clinic opts in to AI-driven experimentation on its leads).
 */
export class ABTestingService {
  constructor(
    private readonly abTests: IABTestingRepository,
    private readonly clinics: IClinicRepository,
    private readonly agent: AgentService,
  ) {}

  async createTest(clinicId: string, consentGiven: boolean, variantCount = 3): Promise<ABTest> {
    if (!consentGiven) {
      throw new AppError(400, 'Se requiere consentimiento para generar variantes con IA');
    }
    const ctx = await this.clinics.getContext(clinicId);
    if (!ctx) throw new AppError(404, 'Clínica no encontrada');

    const variants = await this.agent.generateMessageVariants(ctx, variantCount);
    return this.abTests.create(clinicId, consentGiven, variants);
  }

  async list(clinicId: string): Promise<ABTest[]> {
    return this.abTests.listByClinic(clinicId);
  }

  async results(abTestId: string): Promise<VariantResult[]> {
    const test = await this.abTests.findById(abTestId);
    if (!test) throw new AppError(404, 'Test A/B no encontrado');
    return this.abTests.variantResults(abTestId);
  }

  async recordOutcome(variantId: string, leadId: string, converted: boolean): Promise<void> {
    await this.abTests.recordResult(variantId, leadId, converted);
  }
}
