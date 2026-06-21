import { useEffect, useState } from 'react';
import { metricsApi, type DashboardMetrics, type Lead } from '../services/api';

interface MetricsState {
  metrics: DashboardMetrics | null;
  leads: Lead[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useMetrics(clinicId: string | null): MetricsState {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!clinicId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([metricsApi.overview(clinicId), metricsApi.leads(clinicId)])
      .then(([m, l]) => {
        if (cancelled) return;
        setMetrics(m);
        setLeads(l);
      })
      .catch((e) => !cancelled && setError(e?.message ?? 'Error cargando métricas'))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [clinicId, nonce]);

  return { metrics, leads, loading, error, reload: () => setNonce((n) => n + 1) };
}
