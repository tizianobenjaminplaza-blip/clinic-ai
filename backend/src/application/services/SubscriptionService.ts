import type { ISubscriptionRepository } from '../../domain/repositories/index.js';
import type { Subscription } from '../../domain/entities/index.js';

export class SubscriptionService {
  constructor(private readonly subscriptions: ISubscriptionRepository) {}

  async isAgentActive(clinicId: string): Promise<boolean> {
    const sub = await this.subscriptions.findByClinicId(clinicId);
    return !!sub?.isAgentActive && sub.status === 'ACTIVE';
  }

  async activate(clinicId: string): Promise<Subscription> {
    return this.subscriptions.activate(clinicId);
  }
}
