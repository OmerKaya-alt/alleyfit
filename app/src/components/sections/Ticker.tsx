// Vibecycle-pattern Ticker — sürekli kayan dikişsiz marquee bandı.
// 2× ardışık items dizisi ile -50%'e kadar animasyon → loop noktasında atlama olmaz.
//
// Kullanım:
// <Ticker items={["MAT PILATES", "REFORMER", "PRENATAL", "REHAB"]} speed={30} />

import { motion } from "framer-motion";

export type TickerProps = {
  items: string[];
  /** Tam tur süresi (saniye). Default 30. */
  speed?: number;
};

export default function Ticker({ items, speed = 18 }: TickerProps) {
  // Tek track içinde items × 2 → animasyon 0% → -50% → dikişsiz loop.
  const doubled = [...items, ...items];

  return (
    <section className="overflow-hidden border-y border-vc-accent/30 py-8 bg-vc-accent/[0.06]">
      <motion.div
        className="flex gap-12 whitespace-nowrap shrink-0"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-12 shrink-0">
            <span className="font-serif text-[clamp(1.6rem,4vw,3rem)] tracking-[-0.01em] text-foreground">
              {item}
            </span>
            <span
              aria-hidden="true"
              className="block w-3 h-3 rounded-full bg-vc-accent shrink-0"
            />
          </div>
        ))}
      </motion.div>
    </section>
  );
}
