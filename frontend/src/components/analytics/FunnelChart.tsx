import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface Props {
  data: { stage: string; count: number }[];
}

const colors = ['#065F46', '#047857', '#10B981', '#6EE7B7'];

export function FunnelChart({ data }: Props) {
  return (
    <div className="card-premium p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-ivory-200 tracking-tight">Embudo de conversión</h2>
        <span className="text-xs text-ivory-500">por etapa</span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ left: -20, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.08)" vertical={false} />
          <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#5A625E' }} axisLine={false} tickLine={false} />
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
            cursor={{ fill: 'rgba(16,185,129,0.06)' }}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]} animationDuration={1200} animationEasing="ease-out">
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
