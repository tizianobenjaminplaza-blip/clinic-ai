import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const clinic = await prisma.clinic.upsert({
    where: { email: 'demo@clinicadental.com' },
    update: {},
    create: {
      name: 'Clínica Dental Demo',
      email: 'demo@clinicadental.com',
      phone: '+34911111111',
      whatsappPhone: '34911111111',
      services: {
        create: [
          { name: 'Limpieza dental', description: 'Higiene profesional', price: 49.0 },
          { name: 'Ortodoncia invisible', description: 'Alineadores transparentes', price: 1990.0 },
          { name: 'Implante dental', description: 'Implante de titanio + corona', price: 950.0 },
        ],
      },
      faqs: {
        create: [
          { question: '¿Tienen financiación?', answer: 'Sí, hasta 24 meses sin intereses.' },
          { question: '¿Cuál es el horario?', answer: 'Lunes a viernes de 9:00 a 20:00.' },
        ],
      },
      teamMembers: {
        create: [{ name: 'Dra. Ana López', role: 'Ortodoncista', email: 'ana@clinicadental.com' }],
      },
      subscription: {
        create: { plan: 'PRO', status: 'ACTIVE', isAgentActive: true, startDate: new Date() },
      },
    },
  });

  console.log(`✅ Seeded clinic ${clinic.id} (${clinic.name})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
