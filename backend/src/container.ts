// Composition root — wires concrete implementations into the application layer.
import { prisma } from './infrastructure/database/prisma.js';

import { ClinicRepository } from './infrastructure/repositories/ClinicRepository.js';
import { PaymentRepository } from './infrastructure/repositories/PaymentRepository.js';
import { SubscriptionRepository } from './infrastructure/repositories/SubscriptionRepository.js';
import { LeadRepository } from './infrastructure/repositories/LeadRepository.js';
import { ABTestingRepository } from './infrastructure/repositories/ABTestingRepository.js';
import { ReportRepository } from './infrastructure/repositories/ReportRepository.js';

import { WhatsAppClient } from './infrastructure/external/WhatsAppClient.js';
import { EmailClient } from './infrastructure/external/EmailClient.js';

import { AgentService } from './application/services/AgentService.js';
import { LeadTrackingService } from './application/services/LeadTrackingService.js';
import { SubscriptionService } from './application/services/SubscriptionService.js';
import { WhatsAppService } from './application/services/WhatsAppService.js';
import { AnalyticsService } from './application/services/AnalyticsService.js';
import { ABTestingService } from './application/services/ABTestingService.js';
import { ReportService } from './application/services/ReportService.js';
import { TwoFactorAuthService } from './application/services/TwoFactorAuthService.js';
import { OnboardingService } from './application/services/OnboardingService.js';
import { ActivateAgentUseCase } from './application/usecases/ActivateAgentUseCase.js';

import { PaymentController } from './presentation/controllers/PaymentController.js';
import { WhatsAppController } from './presentation/controllers/WhatsAppController.js';
import { AnalyticsController } from './presentation/controllers/AnalyticsController.js';
import { ABTestingController } from './presentation/controllers/ABTestingController.js';
import { ReportController } from './presentation/controllers/ReportController.js';
import { AuthController } from './presentation/controllers/AuthController.js';
import { DemoController } from './presentation/controllers/DemoController.js';
import { OnboardingController } from './presentation/controllers/OnboardingController.js';

// Repositories
const clinicRepo = new ClinicRepository(prisma);
const paymentRepo = new PaymentRepository(prisma);
const subscriptionRepo = new SubscriptionRepository(prisma);
const leadRepo = new LeadRepository(prisma);
const abTestingRepo = new ABTestingRepository(prisma);
const reportRepo = new ReportRepository(prisma);

// External clients
const whatsappClient = new WhatsAppClient();
const emailClient = new EmailClient();

// Services
const agentService = new AgentService();
const leadTrackingService = new LeadTrackingService(leadRepo);
const subscriptionService = new SubscriptionService(subscriptionRepo);
const analyticsService = new AnalyticsService(leadRepo);
const abTestingService = new ABTestingService(abTestingRepo, clinicRepo, agentService);
const twoFAService = new TwoFactorAuthService(emailClient);
const onboardingService = new OnboardingService(clinicRepo);
const reportService = new ReportService(reportRepo, clinicRepo, analyticsService, emailClient);
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
  paymentController: new PaymentController(activateAgentUseCase, subscriptionService, onboardingService),
  onboardingController: new OnboardingController(onboardingService),
  whatsappController: new WhatsAppController(whatsappService),
  analyticsController: new AnalyticsController(analyticsService),
  abTestingController: new ABTestingController(abTestingService),
  reportController: new ReportController(reportService),
  authController: new AuthController(twoFAService),
  demoController: new DemoController(clinicRepo, leadTrackingService, agentService),
};
