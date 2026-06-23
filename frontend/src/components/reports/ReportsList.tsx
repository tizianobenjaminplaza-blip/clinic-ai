import type { Report } from '../../services/api';

export function ReportsList({ reports }: { reports: Report[] }) {
  if (reports.length === 0) {
    return (
      <p className="text-sm text-ivory-400 py-6 text-center">
        No hay reportes generados todavía.
      </p>
    );
  }

  return (
    <div className="card-premium overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-left text-ivory-500">
          <tr>
            <th className="px-5 py-3 font-medium">Periodo</th>
            <th className="px-5 py-3 font-medium">Generado</th>
            <th className="px-5 py-3 font-medium text-right">PDF</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
              <td className="px-5 py-3 font-semibold text-ivory-200">{r.period}</td>
              <td className="px-5 py-3 text-ivory-400">
                {new Date(r.createdAt).toLocaleDateString('es-ES')}
              </td>
              <td className="px-5 py-3 text-right">
                {r.pdfUrl ? (
                  <a
                    href={r.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-300 hover:text-emerald-200 font-medium"
                  >
                    Descargar ↗
                  </a>
                ) : (
                  <span className="text-ivory-500">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
