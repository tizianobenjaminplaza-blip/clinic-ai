import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env.js';
import type {
  ClinicContext,
  LeadInteraction,
  MessageVariantDraft,
} from '../../domain/entities/index.js';

/**
 * AgentService — wraps the Claude API to generate the assistant's reply for an
 * inbound WhatsApp message, grounded in the clinic's services, FAQs and team.
 */
export class AgentService {
  private readonly anthropic: Anthropic | null;
  private readonly mockMode: boolean;

  constructor() {
    // When no real API key is configured (or it's still the placeholder),
    // run in mock mode so the whole system can be tested for free.
    const key = env.ANTHROPIC_API_KEY;
    this.mockMode = !key || key.includes('REEMPLAZA') || !key.startsWith('sk-ant-');
    this.anthropic = this.mockMode ? null : new Anthropic({ apiKey: key });
    if (this.mockMode) {
      console.warn('⚠️  AgentService running in MOCK mode (no Anthropic API key). Replies are simulated.');
    }
  }

  private buildSystemPrompt(ctx: ClinicContext): string {
    const services = ctx.services
      .map((s) => `- ${s.name}${s.description ? `: ${s.description}` : ''} ($${s.price})`)
      .join('\n');
    const faqs = ctx.faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n');
    const team = ctx.teamMembers.map((t) => `- ${t.name} (${t.role})`).join('\n');

    return [
      `Eres el asistente virtual de la clínica dental "${ctx.clinic.name}".`,
      `Respondes a pacientes por WhatsApp 24/7 de forma cálida, profesional y breve.`,
      `Tu objetivo: resolver dudas, generar confianza y motivar a agendar una cita.`,
      ``,
      `SERVICIOS:\n${services || '(sin servicios cargados)'}`,
      ``,
      `PREGUNTAS FRECUENTES:\n${faqs || '(sin FAQs cargadas)'}`,
      ``,
      `EQUIPO:\n${team || '(sin equipo cargado)'}`,
      ``,
      `CÓMO ESCRIBEN LOS PACIENTES (muy importante):`,
      `- Escriben como en WhatsApp real: con faltas de ortografía ("limpiesa", "ortodonsia",`,
      `  "cuanto bale"), sin tildes ni signos, todo en minúsculas o todo en mayúsculas,`,
      `  con abreviaturas ("xq", "tb", "porfa", "x fa") y emojis.`,
      `- Usan términos coloquiales y regionales distintos para lo mismo: "arreglarme los dientes",`,
      `  "ponerme brackets/frenillos/fierros", "sacarme una muela", "me duele una muela/diente",`,
      `  "limpieza/profilaxis/destartraje", "blanqueamiento/aclaramiento", "carillas/fundas",`,
      `  "plata/precio/cuánto sale/cuánto cobran/presupuesto", "turno/cita/hora/agendar".`,
      `- Interpreta SIEMPRE la intención real aunque el mensaje esté mal escrito o sea ambiguo.`,
      `  Si dudas entre dos intenciones, atiende la más probable y ofrece ayuda con la otra.`,
      `- No corrijas la ortografía del paciente ni se la menciones. Responde natural.`,
      ``,
      `REGLAS:`,
      `- No inventes precios, horarios ni tratamientos fuera de la información dada.`,
      `- Si no sabes algo, ofrece poner en contacto con el equipo humano.`,
      `- Nunca des diagnósticos médicos definitivos; sugiere una valoración presencial.`,
      `- Adapta el tono al del paciente (formal o cercano) y responde en su mismo idioma.`,
      `- Mensajes cortos (apto para WhatsApp). Termina orientando a agendar cuando tenga sentido.`,
    ].join('\n');
  }

  async generateReply(ctx: ClinicContext, history: LeadInteraction[], message: string): Promise<string> {
    if (this.mockMode || !this.anthropic) {
      return this.mockReply(ctx, message, history);
    }

    const messages: Anthropic.MessageParam[] = history.map((h) => ({
      role: h.senderRole === 'LEAD' ? 'user' : 'assistant',
      content: h.content,
    }));
    messages.push({ role: 'user', content: message });

    const response = await this.anthropic.messages.create({
      model: env.ANTHROPIC_MODEL,
      max_tokens: 500,
      system: this.buildSystemPrompt(ctx),
      messages,
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    return text || 'Disculpa, ¿podrías repetir tu consulta?';
  }

  /**
   * Generates A/B message variants for a re-engagement / follow-up campaign.
   * Returns structured drafts (name, message, tone, includesOffer) parsed from
   * Claude's JSON output.
   */
  async generateMessageVariants(ctx: ClinicContext, count = 3): Promise<MessageVariantDraft[]> {
    if (this.mockMode || !this.anthropic) {
      return this.mockVariants(ctx, count);
    }

    const system = [
      `Eres un experto en marketing conversacional para clínicas dentales.`,
      `Genera ${count} variantes de un mensaje de WhatsApp para reactivar leads`,
      `inactivos de la clínica "${ctx.clinic.name}". Cada variante con un tono distinto`,
      `(p.ej. cercano, profesional, urgente) y, si aplica, una oferta.`,
      ``,
      `Devuelve ÚNICAMENTE un array JSON válido, sin texto adicional, con la forma:`,
      `[{"name":"string","message":"string","tone":"string","includesOffer":boolean}]`,
    ].join('\n');

    const response = await this.anthropic.messages.create({
      model: env.ANTHROPIC_MODEL,
      max_tokens: 800,
      system,
      messages: [{ role: 'user', content: `Genera ${count} variantes ahora.` }],
    });

    const raw = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim();

    return this.parseVariants(raw, count);
  }

  // ── Mock mode helpers (free, no API) ──────────────────────────────────
  /** Lowercase + strip accents/diacritics so "cuánto" and "cuanto" match. */
  private normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '') // remove combining accents
      .replace(/[¿?¡!.,;:]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** Tiny Levenshtein for typo-tolerant single-word matching. */
  private editDistance(a: string, b: string): number {
    const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++)
      for (let j = 1; j <= b.length; j++)
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
        );
    return dp[a.length][b.length];
  }

  /**
   * Does the normalized message contain any of the given stems?
   * Matches as a substring (catches "limpiez" in "limpieza") and, for longer
   * stems, tolerates ~1-2 typos per word (catches "limpiesa", "ortodonsia").
   */
  private matches(normMsg: string, stems: string[]): boolean {
    const words = normMsg.split(' ');
    return stems.some((stem) => {
      if (normMsg.includes(stem)) return true;
      if (stem.length < 5) return false; // too short for safe fuzzy match
      const tol = stem.length >= 8 ? 2 : 1;
      return words.some((w) => w.length >= 4 && this.editDistance(w, stem) <= tol);
    });
  }

  /** Deterministic-ish pick so the same lead doesn't get identical lines forever. */
  private pick(options: string[]): string {
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Colloquial / lay terms patients use, mapped to the canonical keyword that
   * tends to appear in a service name. Lets "brackets/fierros" find "Ortodoncia".
   */
  private readonly serviceSynonyms: { triggers: string[]; canonical: string[] }[] = [
    { triggers: ['brackets', 'bracket', 'frenillos', 'fierros', 'alinear', 'enderezar', 'invisalign', 'ortodoncia', 'ortodoncia'], canonical: ['ortodoncia', 'alineador', 'brackets'] },
    { triggers: ['limpieza', 'limpiar', 'profilaxis', 'sarro', 'destartraje', 'higiene'], canonical: ['limpieza', 'higiene', 'profilaxis'] },
    { triggers: ['implante', 'implantes', 'me falta un diente', 'perdi un diente', 'diente postizo'], canonical: ['implante'] },
    { triggers: ['blanqueamiento', 'blanquear', 'aclarar', 'dientes blancos', 'mas blancos'], canonical: ['blanqueamiento', 'estetica'] },
    { triggers: ['carillas', 'carilla', 'fundas', 'veneers'], canonical: ['carilla', 'estetica'] },
    { triggers: ['endodoncia', 'matar el nervio', 'tratamiento de conducto'], canonical: ['endodoncia'] },
    { triggers: ['extraccion', 'sacar', 'sacarme', 'quitar muela', 'muela del juicio', 'cordal'], canonical: ['extraccion', 'cirugia'] },
  ];

  /** Find a clinic service the message refers to — by name overlap or synonym. */
  private findService(ctx: ClinicContext, normMsg: string) {
    // Direct: a word from the service name appears (typo-tolerant).
    const direct = ctx.services.find((s) => {
      const words = this.normalize(s.name).split(' ').filter((w) => w.length > 3);
      return words.some((w) => this.matches(normMsg, [w]));
    });
    if (direct) return direct;

    // Synonym: a colloquial trigger maps to a service whose name has the canonical word.
    for (const syn of this.serviceSynonyms) {
      if (!this.matches(normMsg, syn.triggers)) continue;
      const svc = ctx.services.find((s) => {
        const name = this.normalize(s.name);
        return syn.canonical.some((c) => name.includes(c.slice(0, 6)));
      });
      if (svc) return svc;
    }
    return undefined;
  }

  /** Detect that the message names a day and/or a time (a booking slot). */
  private looksLikeDateTime(m: string): boolean {
    const hasDay = this.matches(m, [
      'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo',
      'manana', 'pasado manana', 'hoy', 'finde', 'fin de semana', 'entre semana',
    ]);
    const hasClock =
      /\b\d{1,2}\s*(h|hs|am|pm)\b/.test(m) ||
      /\b\d{1,2}\s*:\s*\d{2}\b/.test(m) ||
      /\ba las\s*\d/.test(m) ||
      this.matches(m, ['mediodia', 'medio dia', 'por la manana', 'por la tarde', 'por la noche', 'primera hora']);
    return hasDay || hasClock;
  }

  /**
   * Heuristic reply generator used when no Anthropic key is configured.
   * Normalizes the text, matches intent with synonym lists + typo tolerance,
   * uses recent history for context, and varies phrasing — so it copes with
   * how patients really write.
   */
  private mockReply(ctx: ClinicContext, message: string, history: LeadInteraction[] = []): string {
    const m = this.normalize(message);
    const clinic = ctx.clinic.name;

    // Was the agent's last message asking for a day/time to book?
    const lastAgent = [...history].reverse().find((h) => h.senderRole === 'AGENT')?.content ?? '';
    const awaitingDate = /qu[ée] d[ií]a|cu[áa]ndo te|franja|hueco|reserv|agend|te viene/i.test(lastAgent);

    // 1) Specific service mentioned by name (e.g. "ortodoncia", "implante")?
    const svc = this.findService(ctx, m);

    // 2) Loaded FAQ keyword hit.
    const faq = ctx.faqs.find((f) =>
      this.normalize(f.question)
        .split(' ')
        .some((w) => w.length > 4 && this.matches(m, [w])),
    );

    // ── Intent: urgency / pain (highest priority) ──
    if (this.matches(m, ['dolor', 'duele', 'duelen', 'molestia', 'molesta', 'urgencia', 'urgente', 'emergencia', 'sangra', 'flemon', 'hinchad', 'inflamad'])) {
      return this.pick([
        `Lamento que tengas molestias 😟. En ${clinic} damos prioridad a las urgencias. ¿Podrías venir hoy? Te busco el primer hueco disponible.`,
        `Siento que te duela 🦷. Las urgencias las atendemos cuanto antes. ¿Te viene bien venir hoy o mañana a primera hora?`,
      ]);
    }

    // ── Intent: booking confirmation (date/time given, or we asked for it) ──
    // Guard against hours/price questions that also mention a day.
    const askingHours = this.matches(m, ['abren', 'abierto', 'abiertos', 'cierran', 'horario', 'atienden']);
    const askingPrice = this.matches(m, ['precio', 'cuanto', 'cuesta', 'vale', 'cobran', 'presupuesto', 'sale', 'tarifa']);
    if (!askingHours && !askingPrice && (this.looksLikeDateTime(m) || awaitingDate)) {
      return this.pick([
        `¡Perfecto! 🙌 Te he reservado la cita en ${clinic}. Te esperamos. Si quieres, dime tu nombre completo y dejo la reserva confirmada. 🦷`,
        `¡Genial! ✅ Queda anotada tu cita en ${clinic}. Te enviaremos un recordatorio. ¿Me confirmas tu nombre para dejarlo todo registrado?`,
        `¡Estupendo! 😊 Cita agendada en ${clinic}. Cualquier cambio, escríbeme por aquí. ¡Nos vemos pronto! 🦷`,
      ]);
    }

    // ── Intent: financing / insurance ──
    if (this.matches(m, ['financiacion', 'financiar', 'cuotas', 'plazos', 'pagar a plazos', 'seguro', 'mutua', 'aseguradora']) || (faq && this.matches(this.normalize(faq.question), ['financ', 'seguro', 'pago']))) {
      if (faq) return faq.answer;
      return `¡Buena pregunta! 😊 En ${clinic} ofrecemos opciones de financiación para que cuides tu sonrisa sin agobios. ¿Te gustaría que te detalle las condiciones en una valoración?`;
    }

    // ── Intent: price / budget ──
    if (this.matches(m, ['precio', 'precios', 'costo', 'coste', 'cuesta', 'cuanto', 'vale', 'tarifa', 'presupuesto', 'cobran', 'sale', 'plata', 'dinero'])) {
      if (svc) {
        return this.pick([
          `¡Hola! 😊 En ${clinic}, ${svc.name} tiene un precio de $${svc.price}. ¿Quieres que agendemos una valoración para confirmar tu presupuesto exacto?`,
          `Claro 🙌 El precio de ${svc.name} es de $${svc.price}. Si quieres te reservo una valoración sin compromiso para darte el presupuesto final.`,
        ]);
      }
      const top = ctx.services[0];
      return top
        ? `¡Hola! 😊 Depende del tratamiento. Por ejemplo, ${top.name} cuesta $${top.price}. ¿Sobre qué tratamiento te gustaría saber el precio?`
        : `¡Hola! 😊 Los precios dependen del tratamiento. ¿Te gustaría una valoración para darte un presupuesto a medida?`;
    }

    // ── Intent: a specific service (no price asked) ──
    if (svc) {
      return this.pick([
        `¡Genial que te interese ${svc.name}! 😊 En ${clinic} lo realizamos con todas las garantías ($${svc.price}). ¿Quieres que te agende una valoración para explicártelo en detalle?`,
        `${svc.name} es uno de nuestros tratamientos estrella en ${clinic} 🦷 ($${svc.price}). ¿Te reservo una cita de valoración sin compromiso?`,
      ]);
    }

    // ── Intent: schedule / appointment ──
    if (this.matches(m, ['cita', 'citas', 'agendar', 'agenda', 'reservar', 'reserva', 'turno', 'hora para', 'pedir hora', 'quiero ir', 'appointment'])) {
      return this.pick([
        `¡Genial! 🙌 Para agendar tu cita en ${clinic} dime tu nombre y un día que te venga bien, y te confirmo el hueco.`,
        `¡Perfecto! 😊 ¿Qué día y franja (mañana o tarde) te viene mejor? Te reservo la cita enseguida.`,
      ]);
    }

    // ── Intent: hours / opening ──
    if (this.matches(m, ['horario', 'horarios', 'abren', 'abierto', 'abiertos', 'cierran', 'atienden', 'que dias', 'que horas', 'fin de semana', 'entre semana'])) {
      if (faq && this.matches(this.normalize(faq.question), ['horario', 'hora'])) return faq.answer;
      return `¡Hola! 🕘 En ${clinic} atendemos de lunes a viernes de 9:00 a 20:00 y sábados de 9:00 a 14:00. ¿Quieres que te reserve un hueco?`;
    }

    // ── Intent: location / address ──
    if (this.matches(m, ['direccion', 'donde', 'kedan', 'keda', 'ubicacion', 'ubicados', 'como llego', 'mapa', 'parking', 'aparcar', 'localizacion']) && !this.matches(m, ['cuando'])) {
      return `¡Claro! 📍 Estamos en pleno centro, con fácil acceso. Si me dices desde dónde vienes te indico cómo llegar. ¿Quieres aprovechar y agendar una cita?`;
    }

    // ── Intent: services catalogue ──
    if (this.matches(m, ['servicios', 'tratamientos', 'que hacen', 'que ofrecen', 'especialidades'])) {
      const list = ctx.services.slice(0, 4).map((s) => s.name).join(', ');
      return `En ${clinic} ofrecemos ${list || 'una amplia gama de tratamientos'} y más 🦷. ¿Sobre cuál te gustaría más información?`;
    }

    // ── Intent: thanks / goodbye ──
    if (this.matches(m, ['gracias', 'muchas gracias', 'genial', 'perfecto', 'vale gracias', 'hasta luego', 'adios', 'chao'])) {
      return this.pick([
        `¡A ti! 😊 Aquí estamos para lo que necesites. ¡Cuida esa sonrisa! 🦷`,
        `¡Un placer ayudarte! Si quieres agendar tu cita, escríbeme cuando quieras. 😊`,
      ]);
    }

    // ── Intent: greeting / generic ──
    if (this.matches(m, ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'que tal', 'info', 'informacion', 'consulta'])) {
      return `¡Hola! 👋 Bienvenido/a a ${clinic}. Soy el asistente virtual y estoy aquí 24/7. ¿En qué puedo ayudarte? Puedo informarte sobre tratamientos, precios u horarios, o agendar tu cita.`;
    }

    // ── Fallback: FAQ hit, else open question ──
    if (faq) return faq.answer;
    return this.pick([
      `¡Gracias por escribir a ${clinic}! 😊 Cuéntame un poco más y te ayudo: ¿buscas información de un tratamiento, precios, horarios o agendar una cita?`,
      `¡Hola! 🦷 Estoy aquí para ayudarte con ${clinic}. ¿Te interesa saber precios, pedir cita o preguntar por algún tratamiento?`,
    ]);
  }

  private mockVariants(_ctx: ClinicContext, count: number): MessageVariantDraft[] {
    const all: MessageVariantDraft[] = [
      { name: 'Cercano', message: '¡Hola! 😊 Hace un tiempo que no sabemos de ti. ¿Retomamos tu tratamiento dental? Estamos para ayudarte. 🦷', tone: 'cercano', includesOffer: false },
      { name: 'Con oferta', message: '¡Te echamos de menos! 🦷 Vuelve este mes y disfruta de un 15% de descuento en tu próxima limpieza dental. ¿Agendamos?', tone: 'promocional', includesOffer: true },
      { name: 'Profesional', message: 'Buenos días. Le recordamos que su revisión dental está pendiente. Una valoración a tiempo previene tratamientos mayores. ¿Desea agendar?', tone: 'profesional', includesOffer: false },
      { name: 'Urgente', message: '⏰ ¡Últimos huecos del mes! No dejes pasar tu cuidado dental. Reserva ahora y aseguramos tu cita. ¿Te confirmo un horario?', tone: 'urgente', includesOffer: false },
    ];
    return all.slice(0, count);
  }

  private parseVariants(raw: string, count: number): MessageVariantDraft[] {
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]) as MessageVariantDraft[];
        return parsed.slice(0, count).map((v) => ({
          name: String(v.name ?? 'Variante'),
          message: String(v.message ?? ''),
          tone: String(v.tone ?? 'neutral'),
          includesOffer: Boolean(v.includesOffer),
        }));
      } catch {
        /* fall through to default */
      }
    }
    // Defensive fallback so a malformed model response never breaks the flow.
    return [
      {
        name: 'Variante por defecto',
        message: '¡Hola! ¿Seguimos con tu consulta dental? Estamos para ayudarte. 🦷',
        tone: 'cercano',
        includesOffer: false,
      },
    ];
  }
}
