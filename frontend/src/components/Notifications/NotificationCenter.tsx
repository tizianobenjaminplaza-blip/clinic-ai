import { useEffect, useRef, useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';

export function NotificationCenter() {
  const { notifications, unread, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close panel on outside click.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = () => {
    setOpen((o) => !o);
    if (!open) markAllRead();
  };

  const relativeTime = (ts: number) => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    return `${Math.floor(diff / 3600)}h`;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition"
        aria-label="Notificaciones"
      >
        <span className="text-xl">🔔</span>
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Notificaciones</span>
            <button
              onClick={markAllRead}
              className="text-xs text-brand-600 hover:underline"
            >
              Marcar todo leído
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-8">Sin notificaciones</p>
            )}
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`px-4 py-3 flex items-start gap-3 text-sm ${
                  n.read ? 'bg-white' : 'bg-blue-50'
                }`}
              >
                <div className="flex-1 text-slate-700 leading-snug">{n.text}</div>
                <div className="text-xs text-slate-400 shrink-0 mt-0.5">{relativeTime(n.ts)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
