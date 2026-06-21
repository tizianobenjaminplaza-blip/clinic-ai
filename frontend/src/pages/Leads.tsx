import { useAuth } from '../context/AuthContext';
import { useMetrics } from '../hooks/useMetrics';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { LeadMetricsPanel } from '../components/dashboard/LeadMetricsPanel';

export function Leads() {
  const { clinicId } = useAuth();
  const { leads, loading, error } = useMetrics(clinicId);

  return (
    <DashboardLayout title="Leads">
      {loading && <p className="text-slate-400">Cargando leads…</p>}
      {error && <p className="text-rose-600">Error: {error}</p>}
      {!loading && <LeadMetricsPanel leads={leads} />}
    </DashboardLayout>
  );
}
