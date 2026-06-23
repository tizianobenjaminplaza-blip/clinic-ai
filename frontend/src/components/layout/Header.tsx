import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { NotificationCenter } from '../Notifications/NotificationCenter';

export function Header({ title }: { title: string }) {
  const { clinicId, logout } = useAuth();
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between mb-9"
    >
      <div>
        <h1 className="font-display text-[1.7rem] font-medium tracking-tight text-ivory-100 leading-none">
          {title}
        </h1>
        <p className="text-[13px] text-ivory-400 mt-2 tracking-tight">
          Clínica Dental Demo · panel en tiempo real
        </p>
      </div>
      <div className="flex items-center gap-2">
        <NotificationCenter />
        <div className="hidden sm:flex items-center gap-2 rounded-full glass px-3 py-1.5">
          <div className="grid h-7 w-7 place-items-center rounded-full border border-emerald-500/30 bg-emerald-soft text-emerald-200 text-[11px] font-semibold">
            CD
          </div>
          <span className="text-xs font-medium text-ivory-300">{clinicId?.slice(0, 8)}…</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={logout}
          className="px-3.5 py-2 rounded-full text-sm font-medium text-ivory-300 glass hover:text-ivory-100 transition"
        >
          Salir
        </motion.button>
      </div>
    </motion.header>
  );
}
