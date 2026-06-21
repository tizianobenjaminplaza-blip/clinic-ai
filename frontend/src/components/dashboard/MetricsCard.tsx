interface MetricsCardProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: 'brand' | 'green' | 'amber';
}

const accents: Record<NonNullable<MetricsCardProps['accent']>, string> = {
  brand: 'text-brand-600',
  green: 'text-emerald-600',
  amber: 'text-amber-600',
};

export function MetricsCard({ label, value, hint, accent = 'brand' }: MetricsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accents[accent]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
