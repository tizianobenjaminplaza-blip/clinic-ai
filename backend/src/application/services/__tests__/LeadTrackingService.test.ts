import { describe, expect, it, vi } from 'vitest';
import { LeadTrackingService } from '../LeadTrackingService.js';
import type { ILeadRepository } from '../../../domain/repositories/index.js';
import type { Lead } from '../../../domain/entities/index.js';

function makeLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: 'lead_1',
    clinicId: 'clinic_1',
    phone: '34600000000',
    name: 'Test',
    email: null,
    tags: [],
    status: 'NEW',
    messageCount: 1,
    lastMessageDate: new Date(),
    inactivityDays: 0,
    ...overrides,
  };
}

describe('LeadTrackingService', () => {
  it('captures an inbound message and promotes engaged leads', async () => {
    const repo: ILeadRepository = {
      findByClinicAndPhone: vi.fn(),
      upsertFromMessage: vi.fn().mockResolvedValue(makeLead({ messageCount: 2 })),
      addInteraction: vi.fn().mockResolvedValue({}),
      recentInteractions: vi.fn().mockResolvedValue([]),
      markEngaged: vi.fn().mockResolvedValue(undefined),
      listByClinic: vi.fn().mockResolvedValue([]),
      metrics: vi.fn(),
    };
    const service = new LeadTrackingService(repo);

    await service.captureInbound('clinic_1', '34600000000', 'Hola', 'Test');

    expect(repo.upsertFromMessage).toHaveBeenCalledWith('clinic_1', '34600000000', 'Test');
    expect(repo.addInteraction).toHaveBeenCalledWith('lead_1', 'LEAD', 'Hola');
    expect(repo.markEngaged).toHaveBeenCalledWith('lead_1');
  });

  it('does not promote a brand-new single-message lead', async () => {
    const repo: ILeadRepository = {
      findByClinicAndPhone: vi.fn(),
      upsertFromMessage: vi.fn().mockResolvedValue(makeLead({ messageCount: 1 })),
      addInteraction: vi.fn().mockResolvedValue({}),
      recentInteractions: vi.fn().mockResolvedValue([]),
      markEngaged: vi.fn().mockResolvedValue(undefined),
      listByClinic: vi.fn().mockResolvedValue([]),
      metrics: vi.fn(),
    };
    const service = new LeadTrackingService(repo);

    await service.captureInbound('clinic_1', '34600000000', 'Hola');

    expect(repo.markEngaged).not.toHaveBeenCalled();
  });

  it('scores engagement higher for leads than agents', () => {
    const service = new LeadTrackingService({} as ILeadRepository);
    expect(service.scoreEngagement(3, 'LEAD')).toBeGreaterThan(service.scoreEngagement(3, 'AGENT'));
  });
});
