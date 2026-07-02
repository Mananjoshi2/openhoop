import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Toast({ children, onDone, type = 'default' }) {
  useEffect(() => {
    const t = setTimeout(() => onDone?.(), 2600);
    return () => clearTimeout(t);
  }, [onDone]);

  const colors = type === 'success'
    ? 'border-emerald-500/30 bg-emerald-950/90 text-emerald-300'
    : 'border-white/10 bg-slate-900/90 text-white';

  return (
    <motion.div
      initial={{ y: 48, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 48, opacity: 0, scale: 0.95 }}
      className={`pointer-events-none fixed bottom-24 left-1/2 z-[100] -translate-x-1/2 rounded-full border px-6 py-3 text-sm font-medium shadow-2xl backdrop-blur ${colors}`}
    >
      {children}
    </motion.div>
  );
}
