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
  private readonly anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
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
      `REGLAS:`,
      `- No inventes precios, horarios ni tratamientos fuera de la información dada.`,
      `- Si no sabes algo, ofrece poner en contacto con el equipo humano.`,
      `- Nunca des diagnósticos médicos definitivos; sugiere una valoración presencial.`,
      `- Responde en el idioma del paciente. Mensajes cortos (apto para WhatsApp).`,
    ].join('\n');
  }

  async generateReply(ctx: ClinicContext, history: LeadInteraction[], message: string): Promise<string> {
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
