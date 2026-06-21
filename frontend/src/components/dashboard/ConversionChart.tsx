import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface Props {
  data: { date: string; count: number }[];
}

export function ConversionChart({ data }: Props) {
  const formatted = data.map((d) => ({ ...d, label: d.date.slice(5) }));
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-700 mb-4">Leads nuevos (últimos 14 días)</h2>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={formatted} margin={{ left: -20, right: 10 }}>
          <defs>
            <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#2563eb"
            strokeWidth={2}
            fill="url(#leadGrad)"
            name="Leads"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
