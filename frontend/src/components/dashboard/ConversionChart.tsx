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
    <div className="card-premium p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-ivory-200 tracking-tight">Leads nuevos</h2>
        <span className="text-xs text-ivory-500">últimos 14 días</span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={formatted} margin={{ left: -20, right: 10 }}>
          <defs>
            <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.32} />
              <stop offset="70%" stopColor="#10B981" stopOpacity={0.06} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="leadStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6EE7B7" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.08)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#5A625E' }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#5A625E' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: '1px solid rgba(16,185,129,0.20)',
              background: 'rgba(11,15,13,0.92)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 8px 24px -6px rgba(0,0,0,0.6)',
              fontSize: 12,
              color: '#E8EDEA',
            }}
            labelStyle={{ color: '#AEB8B3' }}
            cursor={{ stroke: 'rgba(16,185,129,0.30)', strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="url(#leadStroke)"
            strokeWidth={2}
            fill="url(#leadGrad)"
            name="Leads"
            animationDuration={1600}
            animationEasing="ease-out"
            dot={{ r: 0 }}
            activeDot={{ r: 4, fill: '#6EE7B7', stroke: '#0B0F0D', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
