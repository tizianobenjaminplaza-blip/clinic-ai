import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';

interface Props {
  value: number;
  /** Text appended after the number, e.g. "%" */
  suffix?: string;
  decimals?: number;
  duration?: number;
}

/**
 * Counts up from 0 to `value` on mount (and whenever value changes).
 * Uses framer-motion's `animate` for a smooth eased ramp.
 */
export function AnimatedCounter({ value, suffix = '', decimals = 0, duration = 1.2 }: Props) {
  const [display, setDisplay] = useState(0);
  const nodeRef = useRef(value);

  useEffect(() => {
    const controls = animate(nodeRef.current, value, {
      duration,
      ease: [0.16, 1, 0.3, 1], // expo-out: fast start, soft landing
      onUpdate: (v) => setDisplay(v),
    });
    nodeRef.current = value;
    return () => controls.stop();
  }, [value, duration]);

  return (
    <span>
      {display.toLocaleString('es-ES', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
