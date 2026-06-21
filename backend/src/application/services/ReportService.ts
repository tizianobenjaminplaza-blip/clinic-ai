import { createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import PDFDocument from 'pdfkit';
import type { IClinicRepository, IReportRepository } from '../../domain/repositories/index.js';
import type { LeadReport } from '../../domain/entities/index.js';
import type { AnalyticsService } from './AnalyticsService.js';
import type { EmailClient } from '../../infrastructure/external/EmailClient.js';
import { env } from '../../config/env.js';
import { AppError } from '../../infrastructure/middleware/errorMiddleware.js';

const REPORTS_DIR = path.resolve(process.cwd(), 'reports');

/**
 * ReportService — builds a monthly PDF lead report, persists it, and emails it
 * to the clinic. PDFs are written under ./reports and served statically at
 * /reports/<file>.pdf (see app.ts).
 */
export class ReportService {
  constructor(
    private readonly reports: IReportRepository,
    private readonly clinics: IClinicRepository,
    private readonly analytics: AnalyticsService,
    private readonly email: EmailClient,
  ) {}

  async generateMonthly(clinicId: string, period: string): Promise<LeadReport> {
    const clinic = await this.clinics.findById(clinicId);
    if (!clinic) throw new AppError(404, 'Clínica no encontrada');

    const metrics = await this.analytics.overview(clinicId);

    await mkdir(REPORTS_DIR, { recursive: true });
    const fileName = `report-${clinicId}-${period}-${Date.now()}.pdf`;
    const filePath = path.join(REPORTS_DIR, fileName);

    await this.renderPdf(filePath, clinic.name, period, metrics);

    const pdfUrl = `${env.APP_BASE_URL}/reports/${fileName}`;
    const report = await this.reports.create(clinicId, period, pdfUrl);

    await this.email.send(
      clinic.email,
      `📊 Tu reporte mensual de leads — ${period}`,
      `<p>Hola ${clinic.name},</p>
       <p>Adjuntamos el resumen de tu agente IA para <strong>${period}</strong>.</p>
       <p><a href="${pdfUrl}">Descargar PDF</a></p>`,
    );

    return report;
  }

  async list(clinicId: string): Promise<LeadReport[]> {
    return this.reports.listByClinic(clinicId);
  }

  private renderPdf(
    filePath: string,
    clinicName: string,
    period: string,
    metrics: Awaited<ReturnType<AnalyticsService['overview']>>,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = createWriteStream(filePath);
      stream.on('finish', resolve);
      stream.on('error', reject);
      doc.pipe(stream);

      doc.fontSize(22).fillColor('#1d4ed8').text('Clinic AI — Reporte mensual');
      doc.moveDown(0.3);
      doc.fontSize(12).fillColor('#475569').text(`${clinicName} · ${period}`);
      doc.moveDown(1.5);

      const rows: [string, string | number][] = [
        ['Total de leads', metrics.totalLeads],
        ['Tasa de conversión', `${metrics.conversionRate}%`],
        ['Leads convertidos', metrics.byStatus['CONVERTED'] ?? 0],
        ['Mensajes totales', metrics.totalMessages],
      ];

      doc.fontSize(14).fillColor('#0f172a').text('Métricas clave');
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor('#334155');
      for (const [label, value] of rows) {
        doc.text(`• ${label}: `, { continued: true }).fillColor('#1d4ed8').text(String(value));
        doc.fillColor('#334155');
      }

      doc.moveDown(1);
      doc.fontSize(14).fillColor('#0f172a').text('Embudo de conversión');
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor('#334155');
      for (const stage of metrics.funnel) {
        doc.text(`• ${stage.stage}: ${stage.count}`);
      }

      doc.moveDown(2);
      doc.fontSize(9).fillColor('#94a3b8').text(
        `Generado automáticamente por Clinic AI el ${new Date().toISOString().slice(0, 10)}.`,
      );

      doc.end();
    });
  }
}
