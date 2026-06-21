// Composition root — wires concrete implementations into the application layer.
import { prisma } from './infrastructure/database/prisma.js';

import { ClinicRepository } from './infrastructure/repositories/ClinicRepository.js';
import { PaymentRepository } from './infrastructure/repositories/PaymentRepository.js';
import { SubscriptionRepository } from './infrastructure/repositories/SubscriptionRepository.js';
import { LeadRepository } from './infrastructure/repositories/LeadRepository.js';

import { WhatsAppClient } from './infrastructure/external/WhatsAppClient.js';
import { EmailClient } from './infrastructure/external/EmailClient.js';

import { AgentService } from './application/services/AgentService.js';
import { LeadTrackingService } from './application/services/LeadTrackingService.js';
import { SubscriptionService } from './application/services/SubscriptionService.js';
import { WhatsAppService } from './application/services/WhatsAppService.js';
import { ActivateAgentUseCase } from './application/usecases/ActivateAgentUseCase.js';

import { PaymentController } from './presentation/controllers/PaymentController.js';
import { WhatsAppController } from './presentation/controllers/WhatsAppController.js';

// Repositories
const clinicRepo = new ClinicRepository(prisma);
const paymentRepo = new PaymentRepository(prisma);
const subscriptionRepo = new SubscriptionRepository(prisma);
const leadRepo = new LeadRepository(prisma);

// External clients
const whatsappClient = new WhatsAppClient();
const emailClient = new EmailClient();

// Services
const agentService = new AgentService();
const leadTrackingService = new LeadTrackingService(leadRepo);
const subscriptionService = new SubscriptionService(subscriptionRepo);
const whatsappService = new WhatsAppService(
  clinicRepo,
  subscriptionService,
  leadTrackingService,
  agentService,
  whatsappClient,
);

// Use cases
const activateAgentUseCase = new ActivateAgentUseCase(
  paymentRepo,
  clinicRepo,
  subscriptionService,
  emailClient,
);

// Controllers
export const container = {
  paymentController: new PaymentController(activateAgentUseCase),
  whatsappController: new WhatsAppController(whatsappService),
};
