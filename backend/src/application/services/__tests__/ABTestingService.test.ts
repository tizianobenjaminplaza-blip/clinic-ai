import { describe, expect, it, vi } from 'vitest';
import { ABTestingService } from '../ABTestingService.js';
import { AppError } from '../../../infrastructure/middleware/errorMiddleware.js';
import type { IABTestingRepository, IClinicRepository } from '../../../domain/repositories/index.js';
import type { AgentService } from '../AgentService.js';

describe('ABTestingService', () => {
  const abRepo = {
    create: vi.fn(),
    findById: vi.fn(),
    listByClinic: vi.fn(),
    recordResult: vi.fn(),
    variantResults: vi.fn(),
  } satisfies IABTestingRepository;

  const clinicRepo = {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    findByWhatsappPhone: vi.fn(),
    getContext: vi.fn(),
    create: vi.fn(),
    saveContext: vi.fn(),
  } satisfies IClinicRepository;

  const agent = { generateMessageVariants: vi.fn() } as unknown as AgentService;

  it('rejects test creation without consent (GDPR/CCPA)', async () => {
    const service = new ABTestingService(abRepo, clinicRepo, agent);
    await expect(service.createTest('clinic_1', false)).rejects.toBeInstanceOf(AppError);
    expect(agent.generateMessageVariants).not.toHaveBeenCalled();
  });

  it('generates and persists variants when consent is given', async () => {
    clinicRepo.getContext.mockResolvedValue({
      clinic: { id: 'clinic_1', name: 'Demo', email: 'x@y.z' },
      services: [],
      faqs: [],
      teamMembers: [],
    });
    (agent.generateMessageVariants as ReturnType<typeof vi.fn>).mockResolvedValue([
      { name: 'A', message: 'Hola', tone: 'cercano', includesOffer: false },
    ]);
    abRepo.create.mockResolvedValue({ id: 'ab_1' });

    const service = new ABTestingService(abRepo, clinicRepo, agent);
    await service.createTest('clinic_1', true, 3);

    expect(agent.generateMessageVariants).toHaveBeenCalledWith(expect.anything(), 3);
    expect(abRepo.create).toHaveBeenCalledWith('clinic_1', true, expect.any(Array));
  });
});
