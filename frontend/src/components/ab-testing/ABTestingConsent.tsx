import { motion } from 'framer-motion';

interface Props {
  onConfirm: (variantCount: number) => void;
  loading: boolean;
}

export function ABTestingConsent({ onConfirm, loading }: Props) {
  return (
    <div className="card-premium p-6">
      <h3 className="font-semibold text-amber-300 mb-2">🔬 Crear nuevo test A/B</h3>
      <p className="text-sm text-ivory-400 mb-4 max-w-2xl">
        El agente IA generará variantes de mensajes para reactivar leads inactivos.
        Al confirmar, aceptas el uso de IA para experimentación sobre tus leads
        (cumplimiento GDPR/CCPA).
      </p>
      <div className="flex gap-3">
        {[2, 3, 4].map((n) => (
          <motion.button
            key={n}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            onClick={() => onConfirm(n)}
            className="px-4 py-2 bg-emerald-gradient text-carbon-900 text-sm font-medium rounded-xl shadow-glow disabled:opacity-50 transition"
          >
            {loading ? 'Generando…' : `${n} variantes`}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
