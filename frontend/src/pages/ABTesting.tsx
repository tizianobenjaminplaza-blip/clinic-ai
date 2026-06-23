import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { abTestApi, type ABTest } from '../services/api';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ABTestingConsent } from '../components/ab-testing/ABTestingConsent';
import { ActiveTests } from '../components/ab-testing/ActiveTests';

export function ABTesting() {
  const { clinicId } = useAuth();
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTests = () => {
    if (!clinicId) return;
    setLoading(true);
    abTestApi
      .list(clinicId)
      .then(setTests)
      .catch((e) => setError(e?.message ?? 'Error'))
      .finally(() => setLoading(false));
  };

  useEffect(loadTests, [clinicId]);

  const handleCreate = async (variantCount: number) => {
    if (!clinicId) return;
    setCreating(true);
    setError(null);
    try {
      const test = await abTestApi.create(clinicId, variantCount);
      setTests((prev) => [test, ...prev]);
    } catch (e: unknown) {
      setError((e as Error)?.message ?? 'Error al crear test');
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout title="A/B Testing">
      <ABTestingConsent onConfirm={handleCreate} loading={creating} />
      {error && <p className="mt-4 text-rose-400 text-sm">{error}</p>}
      <div className="mt-6">
        <h2 className="text-sm font-semibold text-ivory-200 mb-3">Tests activos</h2>
        {loading ? (
          <p className="text-ivory-400 text-sm">Cargando…</p>
        ) : (
          <ActiveTests tests={tests} />
        )}
      </div>
    </DashboardLayout>
  );
}
