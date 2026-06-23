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
          { question: '¿Tienen financiación?', answer: 'Sí, ofrecemos financiación hasta 24 meses sin intereses.' },
          { question: '¿Cuál es el horario?', answer: 'Atendemos de lunes a viernes de 9:00 a 20:00 y sábados de 9:00 a 14:00.' },
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

  // ── Demo leads with conversations ──────────────────────────────────────
  const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

  const demoLeads = [
    {
      phone: '34600111222', name: 'María García', status: 'CONVERTED', messageCount: 6,
      lastMessageDate: daysAgo(1),
      convo: [
        ['LEAD', 'Hola, ¿cuánto cuesta una limpieza dental?'],
        ['AGENT', '¡Hola María! 😊 En Clínica Dental Demo, la limpieza dental tiene un precio de $49. ¿Te gustaría agendar una valoración?'],
        ['LEAD', 'Sí, me gustaría. ¿Qué horarios tienen?'],
        ['AGENT', 'Atendemos de lunes a viernes de 9:00 a 20:00 y sábados de 9:00 a 14:00. ¿Cuándo te viene bien?'],
        ['LEAD', 'El sábado a las 10 estaría perfecto'],
        ['AGENT', '¡Genial! Te he reservado el sábado a las 10:00. Te esperamos 🦷'],
      ],
    },
    {
      phone: '34600333444', name: 'Carlos Ruiz', status: 'QUALIFIED', messageCount: 4,
      lastMessageDate: daysAgo(2),
      convo: [
        ['LEAD', 'Buenas, me interesa la ortodoncia invisible'],
        ['AGENT', '¡Hola Carlos! 👋 La ortodoncia invisible con alineadores transparentes tiene un precio de $1990. Incluye seguimiento completo. ¿Quieres una valoración gratuita?'],
        ['LEAD', '¿Tienen financiación?'],
        ['AGENT', 'Sí, ofrecemos financiación hasta 24 meses sin intereses. ¿Te gustaría que agendemos una cita para valorarte?'],
      ],
    },
    {
      phone: '34600555666', name: 'Lucía Fernández', status: 'ENGAGED', messageCount: 3,
      lastMessageDate: daysAgo(3),
      convo: [
        ['LEAD', 'Hola'],
        ['AGENT', '¡Hola! 👋 Bienvenida a Clínica Dental Demo. Soy el asistente virtual y estoy aquí 24/7. ¿En qué puedo ayudarte?'],
        ['LEAD', 'Tengo un dolor de muelas fuerte'],
      ],
    },
    {
      phone: '34600777888', name: 'Javier Moreno', status: 'NEW', messageCount: 1,
      lastMessageDate: daysAgo(0),
      convo: [
        ['LEAD', '¿Hacen implantes?'],
      ],
    },
    {
      phone: '34600999000', name: 'Sofía Díaz', status: 'LOST', messageCount: 2,
      lastMessageDate: daysAgo(10),
      convo: [
        ['LEAD', 'Precio blanqueamiento?'],
        ['AGENT', '¡Hola Sofía! Gracias por escribir. ¿Te gustaría agendar una valoración para darte un presupuesto exacto?'],
      ],
    },
  ] as const;

  for (const l of demoLeads) {
    const lead = await prisma.lead.upsert({
      where: { clinicId_phone: { clinicId: clinic.id, phone: l.phone } },
      update: {},
      create: {
        clinicId: clinic.id,
        phone: l.phone,
        name: l.name,
        status: l.status,
        messageCount: l.messageCount,
        lastMessageDate: l.lastMessageDate,
      },
    });

    // Re-create interactions only if none exist yet.
    const existing = await prisma.leadInteraction.count({ where: { leadId: lead.id } });
    if (existing === 0) {
      let t = l.lastMessageDate.getTime() - l.convo.length * 60_000;
      for (const [role, content] of l.convo) {
        await prisma.leadInteraction.create({
          data: {
            leadId: lead.id,
            senderRole: role,
            content,
            timestamp: new Date(t),
          },
        });
        t += 60_000;
      }
    }
  }

  console.log(`✅ Seeded ${demoLeads.length} demo leads with conversations`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
