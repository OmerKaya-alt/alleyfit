// Vibecycle-pattern StepGrid — numaralı adım kartları, üst sınır çizgisi ile.
// Mobilde tek kolon, md'de 2, lg'de 5 kolon.
//
// Kullanım:
// <StepGrid items={[
//   { n: "01", title: "Tanışma", body: "İlk seansta hedeflerinizi konuşuruz…" },
//   { n: "02", title: "Değerlendirme", body: "Postür ve hareket analizi…" },
//   { n: "03", title: "Plan", body: "Size özel program hazırlanır…" },
//   { n: "04", title: "Uygulama", body: "Düzenli seanslarla ilerleme…" },
//   { n: "05", title: "Süreklilik", body: "Yaşam boyu sağlıklı hareket…" },
// ]} />

import Reveal from "@/components/motion/Reveal";

export type StepGridItem = {
  n: string;
  title: string;
  body: string;
};

export type StepGridProps = {
  items: StepGridItem[];
};

export default function StepGrid({ items }: StepGridProps) {
  return (
    <section className="px-[var(--pad-x)] py-[var(--pad-y)]">
      <Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 md:gap-8">
          {items.map((item, i) => (
            <div key={i} className="border-t border-vc-accent/30 pt-6">
              <span className="font-serif text-[clamp(2.6rem,4vw,3.6rem)] tracking-[-0.02em] text-foreground/35 font-medium">
                {item.n}
              </span>
              <h4 className="font-serif text-[1.4rem] tracking-[-0.01em] mt-3">
                {item.title}
              </h4>
              <p className="text-foreground/70 text-[0.95rem] leading-relaxed mt-3">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
