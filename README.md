# Clinic AI Agent

SaaS donde clínicas dentales activan un agente IA que responde por WhatsApp 24/7,
captura leads y aumenta conversiones. El pago con Stripe activa el agente
automáticamente y dispara el onboarding por email.

> **Estado:** _vertical slice funcional del backend_. Flujo de punta a punta
> implementado: **Stripe checkout → webhook → activa agente** y
> **WhatsApp → Claude → captura de lead → respuesta**. Frontend, mobile e infra
> (K8s/Terraform/CI) están planificados pero aún no incluidos.

## Stack (este slice)

- TypeScript + Express con **Clean Architecture**
  (`domain` → `application` → `infrastructure` → `presentation`)
- PostgreSQL + Prisma
- Claude API (`@anthropic-ai/sdk`)
- Stripe (checkout + webhooks)
- WhatsApp Cloud API (Meta)

## Arquitectura

```
presentation (controllers/routes)
        │  depende de
        ▼
application (services / usecases)  ──►  domain (entities / repository interfaces)
        ▲                                        ▲
        │  implementa                            │
infrastructure (Prisma repos, Stripe, WhatsApp, Email)
```

La composición de dependencias vive en [`backend/src/container.ts`](backend/src/container.ts).

## Flujos implementados

**1. Activación por pago**
`POST /api/payments/checkout` → Stripe Checkout → `POST /api/payments/webhook`
(`checkout.session.completed`) → `ActivateAgentUseCase`:
registra el pago como `PAID` (idempotente), activa la suscripción/agente y
envía el email de onboarding.

**2. Agente IA por WhatsApp (24/7)**
`POST /api/whatsapp/webhook` → `WhatsAppService`: resuelve la clínica por su
número, verifica que el agente esté activo, captura el lead + interacción,
pide la respuesta a Claude con el contexto de la clínica (servicios, FAQs,
equipo) y responde por WhatsApp.

## Puesta en marcha (local)

```bash
cd backend
cp ../.env.example ../.env        # y rellena las claves
npm install
docker compose -f ../docker-compose.yml up -d postgres   # o tu propio Postgres
npm run prisma:migrate            # crea el esquema
npm run prisma:seed               # clínica demo con agente activo
npm run dev                       # http://localhost:4000/health
```

### Probar el webhook de Stripe en local

```bash
stripe listen --forward-to localhost:4000/api/payments/webhook
stripe trigger checkout.session.completed
```

### Probar el agente de WhatsApp

Configura el webhook en Meta apuntando a `/api/whatsapp/webhook` con el
`WHATSAPP_VERIFY_TOKEN` del `.env`, o envía un POST simulando el payload de Meta.

## Tests

```bash
cd backend && npm test
```

## Variables de entorno

Ver [`.env.example`](.env.example).

## Roadmap

- [ ] Frontend React + Tailwind + Recharts (dashboard, A/B testing, analytics)
- [ ] Mobile React Native + Expo
- [ ] A/B testing, scoring ML de leads, reportes PDF, notificaciones Socket.io
- [ ] Auth0 + 2FA, compliance GDPR/CCPA
- [ ] K8s, Terraform AWS, GitHub Actions CI/CD
```
