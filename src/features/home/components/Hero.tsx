import { useEffect, useRef, useState } from 'react';
import StoreButtons from './StoreButtons';

const SLIDES = [
  { src: '/slide/image1.png', alt: 'KicKR app splash screen' },
  { src: '/slide/image2.png', alt: 'Discover sports events screen' },
  { src: '/slide/image3.png', alt: 'Football event detail screen' },
];

const SLIDE_INTERVAL = 4000;

/** Faint topographic contour lines drifting across the hero background. */
function HeroContours() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {[0, 46, 92, 138, 184, 230, 276, 322].map((dy) => (
        <path
          key={dy}
          d={`M-40,${180 + dy} C260,${110 + dy} 520,${250 + dy} 820,${190 + dy} C1080,${140 + dy} 1280,${240 + dy} 1500,${170 + dy}`}
          fill="none"
          stroke="rgba(123,47,247,0.06)"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

/** Layered violet / magenta waves sweeping up the bottom-right of the hero. */
function HeroWaves() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[560px] w-full"
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

/** App screenshots cycling inside an iPhone 17 Pro frame. */
function PhoneSlider() {
  const [active, setActive] = useState(1);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduce) return;

    timerRef.current = window.setInterval(
      () => setActive((i) => (i + 1) % SLIDES.length),
      SLIDE_INTERVAL,
    );
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="relative z-[3] flex flex-col items-center gap-6">
      <div
        className="relative h-[510px] w-[242px] rounded-[50px] bg-[linear-gradient(145deg,#3b4048,#1b1e23_45%,#2c3038)] p-[3px] shadow-[0_50px_90px_-30px_rgba(11,15,25,0.7)]"
        aria-roledescription="carousel"
        aria-label="KicKR app screenshots"
      >
        {/* titanium rail highlight */}
        <div className="pointer-events-none absolute inset-0 rounded-[50px] ring-1 ring-inset ring-white/10" />

        {/* side buttons */}
        <span className="absolute -left-[3px] top-[92px] h-9 w-[3px] rounded-l bg-[#23262c]" />
        <span className="absolute -left-[3px] top-[141px] h-16 w-[3px] rounded-l bg-[#23262c]" />
        <span className="absolute -left-[3px] top-[215px] h-16 w-[3px] rounded-l bg-[#23262c]" />
        <span className="absolute -right-[3px] top-[173px] h-24 w-[3px] rounded-r bg-[#23262c]" />

        {/* black bezel */}
        <div className="relative h-full w-full overflow-hidden rounded-[47px] bg-black p-[10px]">
          <div className="relative h-full w-full overflow-hidden rounded-[38px] bg-black">
            {SLIDES.map((slide, i) => (
              <img
                key={slide.src}
                src={slide.src}
                alt={slide.alt}
                loading={i === 0 ? 'eager' : 'lazy'}
                aria-hidden={i !== active}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                  i === active ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}

            {/* Dynamic Island */}
            <div className="absolute left-1/2 top-[13px] z-10 h-[26px] w-[92px] -translate-x-1/2 rounded-full bg-black" />
          </div>
        </div>
      </div>

      {/* slide indicators */}
      <div className="flex gap-2.5">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Show ${slide.alt}`}
            aria-current={i === active}
            onClick={() => setActive(i)}
            className={`h-2 rounded-full transition-all ${
              i === active
                ? 'w-6 bg-gold'
                : 'w-2 bg-ink/15 hover:bg-ink/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex h-full flex-col justify-center overflow-hidden bg-[radial-gradient(120%_120%_at_15%_0%,#ffffff_0%,#f7f3fb_55%,#f2ecf9_100%)] pb-16"
    >
      {/* <HeroContours /> */}

      <div className="relative z-[2] mx-auto grid max-w-[1180px] items-center gap-10 px-8 md:grid-cols-[8fr_2fr]">
        <div>
          <h1 className="max-w-[13ch] text-[clamp(2.5rem,5vw,4rem)] font-light leading-[1.12] text-ink">
            Every{' '}
            <span className="font-semibold italic text-gold">
              football event
            </span>{' '}
            managed in one place
          </h1>

          <p className="mt-6 max-w-[42ch] text-[1.05rem] leading-relaxed text-cream-dim">
            KicKR makes it simple to create and manage football events, teams,
            players, matches, schedules, and results — all in one powerful
            platform.
          </p>

          <StoreButtons className="mt-10" variant="gold" />
        </div>

        <div className="flex translate-y-6 justify-center md:justify-end  pt-12">
          <PhoneSlider />
        </div>
      </div>

      <HeroWaves />
    </section>
  );
}
