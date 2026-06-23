import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

/** Container that fades/slides its children in with a staggered cascade. */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.08, delayChildren: 0.05 },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/** A single item inside a PageTransition / stagger container. */
export const reveal = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 24 },
  },
} as const;

export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={reveal} className={className}>
      {children}
    </motion.div>
  );
}
