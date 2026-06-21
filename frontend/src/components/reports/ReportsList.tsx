import type { Report } from '../../services/api';

export function ReportsList({ reports }: { reports: Report[] }) {
  if (reports.length === 0) {
    return (
      <p className="text-sm text-slate-400 py-6 text-center">
        No hay reportes generados todavía.
      </p>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-400">
          <tr>
            <th className="px-5 py-3 font-medium">Periodo</th>
            <th className="px-5 py-3 font-medium">Generado</th>
            <th className="px-5 py-3 font-medium text-right">PDF</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r.id} className="border-t border-slate-50 hover:bg-slate-50">
              <td className="px-5 py-3 font-semibold text-slate-700">{r.period}</td>
              <td className="px-5 py-3 text-slate-500">
                {new Date(r.createdAt).toLocaleDateString('es-ES')}
              </td>
              <td className="px-5 py-3 text-right">
                {r.pdfUrl ? (
                  <a
                    href={r.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 hover:underline font-medium"
                  >
                    Descargar ↗
                  </a>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
