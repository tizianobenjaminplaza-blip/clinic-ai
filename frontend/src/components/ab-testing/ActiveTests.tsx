import type { ABTest } from '../../services/api';
import { VariantResults } from './VariantResults';

export function ActiveTests({ tests }: { tests: ABTest[] }) {
  if (tests.length === 0) {
    return (
      <p className="text-sm text-slate-400 py-6 text-center">
        No hay tests creados todavía. Crea uno arriba.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {tests.map((t) => (
        <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-slate-400 font-mono">{t.id}</p>
              <p className="text-sm text-slate-600">
                {t.variants.length} variantes ·{' '}
                {new Date(t.generatedAt).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>

          <div className="mb-3 space-y-2">
            {t.variants.map((v) => (
              <div key={v.id} className="bg-slate-50 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-slate-700">{v.name}</span>
                  <span className="text-xs text-slate-400">· {v.tone}</span>
                  {v.includesOffer && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-1.5 rounded">oferta</span>
                  )}
                </div>
                <p className="text-sm text-slate-600">{v.message}</p>
              </div>
            ))}
          </div>

          <VariantResults testId={t.id} status={t.status} />
        </div>
      ))}
    </div>
  );
}
