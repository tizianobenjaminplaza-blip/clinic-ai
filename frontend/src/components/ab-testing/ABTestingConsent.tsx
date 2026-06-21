interface Props {
  onConfirm: (variantCount: number) => void;
  loading: boolean;
}

export function ABTestingConsent({ onConfirm, loading }: Props) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
      <h3 className="font-semibold text-amber-800 mb-2">🔬 Crear nuevo test A/B</h3>
      <p className="text-sm text-amber-700 mb-4">
        El agente IA generará variantes de mensajes para reactivar leads inactivos.
        Al confirmar, aceptas el uso de IA para experimentación sobre tus leads
        (cumplimiento GDPR/CCPA).
      </p>
      <div className="flex gap-3">
        {[2, 3, 4].map((n) => (
          <button
            key={n}
            disabled={loading}
            onClick={() => onConfirm(n)}
            className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 transition"
          >
            {loading ? 'Generando…' : `${n} variantes`}
          </button>
        ))}
      </div>
    </div>
  );
}
