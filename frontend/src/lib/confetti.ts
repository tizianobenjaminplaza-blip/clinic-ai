import confetti from 'canvas-confetti';

/** Brand-colored confetti burst — fired when a lead converts or a sale lands. */
export function celebrate() {
  const colors = ['#4f46e5', '#8b5cf6', '#a78bfa', '#22d3ee'];
  const defaults = { spread: 70, ticks: 200, gravity: 0.9, scalar: 1, colors };

  confetti({ ...defaults, particleCount: 60, origin: { y: 0.3, x: 0.5 } });
  setTimeout(() => confetti({ ...defaults, particleCount: 40, angle: 60, origin: { x: 0 } }), 150);
  setTimeout(() => confetti({ ...defaults, particleCount: 40, angle: 120, origin: { x: 1 } }), 300);
}
