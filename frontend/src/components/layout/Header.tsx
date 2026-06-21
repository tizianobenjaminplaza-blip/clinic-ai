import { useAuth } from '../../context/AuthContext';
import { NotificationCenter } from '../Notifications/NotificationCenter';

export function Header({ title }: { title: string }) {
  const { clinicId, logout } = useAuth();
  return (
    <header className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
      <div className="flex items-center gap-3 text-sm">
        <NotificationCenter />
        <span className="text-slate-400 hidden sm:block">|</span>
        <span className="text-slate-500 hidden sm:block">
          <span className="font-mono text-slate-700">{clinicId?.slice(0, 8)}…</span>
        </span>
        <button
          onClick={logout}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          Salir
        </button>
      </div>
    </header>
  );
}
