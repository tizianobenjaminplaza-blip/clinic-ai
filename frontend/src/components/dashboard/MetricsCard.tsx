import { motion } from 'framer-motion';
import { reveal } from '../motion/PageTransition';
import { AnimatedCounter } from '../motion/AnimatedCounter';

interface MetricsCardProps {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
  hint?: string;
  icon?: string;
  trend?: number;
  accent?: 'emerald' | 'platinum' | 'neutral';
}

const accents = {
  emerald: { text: 'text-emerald-300', ring: 'from-emerald-500/20 to-emerald-500/0', icon: 'text-emerald-300 border-emerald-500/25' },
  platinum: { text: 'text-platinum-200', ring: 'from-platinum-200/15 to-platinum-200/0', icon: 'text-platinum-200 border-platinum-300/25' },
  neutral: { text: 'text-ivory-100', ring: 'from-ivory-100/10 to-ivory-100/0', icon: 'text-ivory-300 border-ivory-400/25' },
} as const;

export function MetricsCard({
  label,
  value,
  suffix = '',
  decimals = 0,
  hint,
  icon,
  trend,
  accent = 'emerald',
}: MetricsCardProps) {
  const a = accents[accent];
  return (
    <motion.div
      variants={reveal}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className="card-premium p-5 overflow-hidden"
    >
      <div className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${a.ring} blur-2xl`} />

      <div className="relative flex items-start justify-between">
        <p className="text-[13px] font-medium text-ivory-400 tracking-tight">{label}</p>
        {icon && (
          <div className={`grid h-9 w-9 place-items-center rounded-lg border bg-white/[0.02] text-sm ${a.icon}`}>{icon}</div>
        )}
      </div>

      <p className={`font-display relative mt-4 text-[2rem] font-medium tracking-tight leading-none ${a.text}`}>
        <AnimatedCounter value={value} suffix={suffix} decimals={decimals} />
      </p>

      <div className="relative mt-2 flex items-center gap-2">
        {typeof trend === 'number' && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
              trend >= 0 ? 'bg-emerald-500/12 text-emerald-300' : 'bg-rose-500/12 text-rose-300'
            }`}
          >
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
        {hint && <p className="text-xs text-ivory-500 tracking-tight">{hint}</p>}
      </div>
    </motion.div>
  );
}
