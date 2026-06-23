import { useEffect, useState } from 'react';
import { abTestApi, type VariantResult } from '../../services/api';

const statusColors: Record<string, string> = {
  RUNNING: 'bg-emerald-500/15 text-emerald-300',
  COMPLETED: 'bg-emerald-500/15 text-emerald-300',
  DRAFT: 'bg-ivory-400/15 text-ivory-300',
};

export function VariantResults({ testId, status }: { testId: string; status: string }) {
  const [results, setResults] = useState<VariantResult[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    abTestApi.results(testId).then(setResults).catch(console.error);
  }, [open, testId]);

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 text-sm font-medium text-ivory-300 transition"
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
            <thead className="bg-white/5 text-ivory-500 text-left">
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
                  <td colSpan={4} className="px-4 py-4 text-center text-ivory-500">
                    Sin resultados todavía
                  </td>
                </tr>
              )}
              {results.map((r) => (
                <tr key={r.variantId} className="border-t border-white/5">
                  <td className="px-4 py-3 font-medium text-ivory-200">{r.name}</td>
                  <td className="px-4 py-3 text-right text-ivory-300">{r.sent}</td>
                  <td className="px-4 py-3 text-right text-emerald-300">{r.converted}</td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-300">
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
