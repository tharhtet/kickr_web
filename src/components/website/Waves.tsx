/**
 * Layered violet / magenta waves sweeping up the bottom-right of a section.
 * Pins to the bottom of the nearest positioned ancestor; size it via `className`.
 */
export default function Waves({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none absolute inset-x-0 bottom-0 z-[1] w-full ${className}`}
      viewBox="0 0 1440 560"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="wave-back" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3e2fb" />
          <stop offset="1" stopColor="#e6c9f6" />
        </linearGradient>
        <linearGradient id="wave-mid" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d98cec" />
          <stop offset="1" stopColor="#b23ce0" />
        </linearGradient>
        <linearGradient id="wave-front" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c840e8" />
          <stop offset="1" stopColor="#8b2fe0" />
        </linearGradient>
      </defs>
      <path
        d="M0,300 C280,220 520,360 820,300 C1080,248 1260,120 1440,60 L1440,560 L0,560 Z"
        fill="url(#wave-back)"
        opacity="0.7"
      />
      <path
        d="M0,392 C260,332 480,432 820,392 C1100,358 1290,210 1440,150 L1440,560 L0,560 Z"
        fill="url(#wave-mid)"
        opacity="0.9"
      />
      <path
        d="M0,462 C240,420 500,486 800,466 C1060,448 1268,312 1440,250 L1440,560 L0,560 Z"
        fill="url(#wave-front)"
      />
    </svg>
  );
}
