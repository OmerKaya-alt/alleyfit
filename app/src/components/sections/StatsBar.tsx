// Vibecycle-pattern StatsBar — viewport'a girince 0'dan hedef değere sayan istatistik bandı.
// requestAnimationFrame + ease-out cubic ile 1.6s yumuşak counter.
//
// Kullanım:
// <StatsBar items={[
//   { value: 12, suffix: "+", label: "YIL DENEYİM" },
//   { value: 800, suffix: "+", label: "MUTLU ÜYE" },
//   { value: 25, label: "HAFTALIK DERS" },
//   { value: 6, label: "UZMAN EĞİTMEN" },
// ]} />

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import Reveal from "@/components/motion/Reveal";

export type StatsBarItem = {
  value: number;
  suffix?: string;
  label: string;
};

export type StatsBarProps = {
  items: StatsBarItem[];
};

// ease-out cubic — Vibecycle hissiyatı, sonda yavaşlayan rakam akışı.
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function CountUp({ value, suffix }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1600;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      setCount(Math.round(value * eased));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {count}
      {suffix ?? ""}
    </span>
  );
}

export default function StatsBar({ items }: StatsBarProps) {
  return (
    <section className="px-[var(--pad-x)] py-[clamp(60px,10vw,140px)] bg-background border-y border-border">
      <Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8 max-w-site mx-auto">
          {items.map((item, i) => (
            <div key={i} className="text-center md:text-left">
              <h3 className="font-serif text-[clamp(2.6rem,5vw,5rem)] leading-[0.95] tracking-[-0.02em]">
                <CountUp value={item.value} suffix={item.suffix} />
              </h3>
              <span className="inline-flex items-center gap-3 mt-4 text-[0.95rem] uppercase tracking-[0.18em] text-vc-accent font-semibold">
                <span aria-hidden className="block w-8 h-px bg-vc-accent" />
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
