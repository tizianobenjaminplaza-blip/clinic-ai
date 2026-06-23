/**
 * Hidden SVG filter that powers the "liquid glass" refraction.
 * Rendered once near the app root; surfaces reference it via
 * `backdrop-filter: url(#liquid-glass)`.
 *
 * feTurbulence generates organic noise → feDisplacementMap uses it to
 * bend the backdrop, mimicking light refracting through thick, wet glass.
 */
export function LiquidGlassFilter() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute h-0 w-0"
      style={{ position: 'absolute' }}
    >
      <defs>
        <filter id="liquid-glass" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008 0.012"
            numOctaves="2"
            seed="7"
            result="noise"
          >
            {/* Slow drift so the refraction subtly breathes */}
            <animate
              attributeName="baseFrequency"
              dur="24s"
              values="0.008 0.012;0.012 0.008;0.008 0.012"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feGaussianBlur in="noise" stdDeviation="1.2" result="softNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="softNoise"
            scale="14"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
