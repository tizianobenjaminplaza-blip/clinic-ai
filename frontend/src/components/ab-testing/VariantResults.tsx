import { useEffect, useState } from 'react';
import { abTestApi, type VariantResult } from '../../services/api';

const statusColors: Record<string, string> = {
  RUNNING: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  DRAFT: 'bg-slate-100 text-slate-600',
};

export function VariantResults({ testId, status }: { testId: string; status: string }) {
  const [results, setResults] = useState<VariantResult[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    abTestApi.results(testId).then(setResults).catch(console.error);
  }, [open, testId]);

  return (
    <div className="border border-slate-100 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 text-sm font-medium text-slate-700"
      >
        <span className="flex items-center gap-2">
          {open ? '▾' : '▸'} Ver resultados
          <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[status] ?? ''}`}>
            {status}
          </span>
        </span>
      </button>
      {open && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-400 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Variante</th>
                <th className="px-4 py-2 font-medium text-right">Enviados</th>
                <th className="px-4 py-2 font-medium text-right">Convertidos</th>
                <th className="px-4 py-2 font-medium text-right">Tasa</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-slate-400">
                    Sin resultados todavía
                  </td>
                </tr>
              )}
              {results.map((r) => (
                <tr key={r.variantId} className="border-t border-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-700">{r.name}</td>
                  <td className="px-4 py-3 text-right">{r.sent}</td>
                  <td className="px-4 py-3 text-right text-emerald-600">{r.converted}</td>
                  <td className="px-4 py-3 text-right font-semibold text-brand-600">
                    {r.conversionRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
