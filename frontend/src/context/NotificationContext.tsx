import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

export interface Notification {
  id: string;
  type: 'lead:new' | 'lead:engaged' | 'message:in' | 'payment:activated';
  text: string;
  ts: number;
  read: boolean;
}

interface NotificationState {
  notifications: Notification[];
  unread: number;
  markAllRead: () => void;
}

const NotificationContext = createContext<NotificationState | undefined>(undefined);

function makeId() { return Math.random().toString(36).slice(2); }

const LABELS: Record<Notification['type'], (p: Record<string, string>) => string> = {
  'lead:new':          (p) => `🆕 Nuevo lead: ${p.name ?? p.phone}`,
  'lead:engaged':      ()  => `💬 Lead pasó a ENGAGED`,
  'message:in':        (p) => `📨 Mensaje recibido: "${p.text?.slice(0, 40)}…"`,
  'payment:activated': ()  => `⚡ Agente activado por nuevo pago`,
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { clinicId } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!clinicId) return;

    // Dev: VITE_API_URL unset → '/' (Vite proxies /socket.io). Prod: backend URL.
    const socketUrl = import.meta.env.VITE_API_URL || '/';
    const socket = io(socketUrl, { path: '/socket.io', transports: ['websocket'] });
    socketRef.current = socket;
    socket.emit('join:clinic', clinicId);

    const events: Notification['type'][] = ['lead:new', 'lead:engaged', 'message:in', 'payment:activated'];
    events.forEach((ev) => {
      socket.on(ev, (payload: Record<string, string>) => {
        const text = LABELS[ev]?.(payload) ?? ev;
        setNotifications((prev) => [
          { id: makeId(), type: ev, text, ts: Date.now(), read: false },
          ...prev.slice(0, 49),
        ]);
      });
    });

    return () => { socket.disconnect(); socketRef.current = null; };
  }, [clinicId]);

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unread, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationState {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be inside NotificationProvider');
  return ctx;
}
