import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env.js';
import type { ClinicContext, LeadInteraction } from '../../domain/entities/index.js';

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
}
