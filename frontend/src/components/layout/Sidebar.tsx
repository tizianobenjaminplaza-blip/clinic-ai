import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '◈' },
  { to: '/demo', label: 'Demo en vivo', icon: '✦' },
  { to: '/leads', label: 'Leads', icon: '◉' },
  { to: '/analytics', label: 'Analytics', icon: '◍' },
  { to: '/ab-testing', label: 'A/B Testing', icon: '⬡' },
  { to: '/reports', label: 'Reportes', icon: '▦' },
  { to: '/billing', label: 'Activación', icon: '◆' },
];

export function Sidebar() {
  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 hidden md:flex flex-col glass-strong">
      {/* Brand */}
      <div className="px-6 py-7 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-500/30 bg-emerald-soft text-emerald-300 text-lg">
          🦷
        </div>
        <div>
          <div className="font-display text-lg font-medium leading-none text-emerald-grad tracking-tight">
            Clinic AI
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-ivory-400 font-medium mt-1.5">
            Agente 24/7
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 mt-3">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} className="block">
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'text-emerald-200' : 'text-ivory-400 hover:text-ivory-100'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-lg bg-emerald-soft border border-emerald-500/20"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                {isActive && (
                  <motion.span
                    layoutId="activeBar"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-emerald-gradient"
                  />
                )}
                <span className="relative text-sm opacity-80">{l.icon}</span>
                <span className="relative tracking-tight">{l.label}</span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Status card */}
      <div className="m-3 rounded-xl border border-emerald-500/15 bg-emerald-soft p-4 overflow-hidden relative">
        <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-emerald-500/10 blur-2xl animate-pulse-glow" />
        <div className="relative">
          <div className="text-xs font-semibold text-emerald-200 tracking-tight">Plan PRO activo</div>
          <div className="text-[11px] text-ivory-400 mt-0.5">Agente IA respondiendo 24/7</div>
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-ivory-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            En línea
          </div>
        </div>
      </div>
    </aside>
  );
}
