import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportApi, type Report } from '../services/api';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ReportsList } from '../components/reports/ReportsList';

function currentPeriod() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function Reports() {
  const { clinicId } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReports = () => {
    if (!clinicId) return;
    setLoading(true);
    reportApi
      .list(clinicId)
      .then(setReports)
      .catch((e) => setError(e?.message ?? 'Error'))
      .finally(() => setLoading(false));
  };

  useEffect(loadReports, [clinicId]);

  const generate = async () => {
    if (!clinicId) return;
    setGenerating(true);
    setError(null);
    try {
      const r = await reportApi.generate(clinicId, currentPeriod());
      setReports((prev) => [r, ...prev]);
    } catch (e: unknown) {
      setError((e as Error)?.message ?? 'Error al generar reporte');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <DashboardLayout title="Reportes">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">Reportes PDF mensuales enviados por email.</p>
        <button
          disabled={generating}
          onClick={generate}
          className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 transition"
        >
          {generating ? 'Generando…' : `Generar ${currentPeriod()}`}
        </button>
      </div>
      {error && <p className="mb-4 text-rose-600 text-sm">{error}</p>}
      {loading ? (
        <p className="text-slate-400 text-sm">Cargando…</p>
      ) : (
        <ReportsList reports={reports} />
      )}
    </DashboardLayout>
  );
}
