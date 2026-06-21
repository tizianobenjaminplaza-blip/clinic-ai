import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/leads', label: 'Leads', icon: '👥' },
  { to: '/analytics', label: 'Analytics', icon: '📈' },
];

export function Sidebar() {
  return (
    <aside className="w-60 shrink-0 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col">
      <div className="px-6 py-5 text-lg font-bold text-brand-600">🦷 Clinic AI</div>
      <nav className="flex-1 px-3 space-y-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            <span>{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-6 py-4 text-xs text-slate-400">v0.1.0 · slice</div>
    </aside>
  );
}
