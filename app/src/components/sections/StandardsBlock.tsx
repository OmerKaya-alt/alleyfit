// Vibecycle-pattern StandardsBlock — secondary zeminde 50/50 görsel + numaralı liste.
// Sol 4/5 görsel, sağ üstte eyebrow + büyük başlık + altında numaralı bullet listesi.
//
// Kullanım:
// <StandardsBlock
//   title="Her seansta aynı kalite, aynı özen."
//   image="https://…"
//   bullets={[
//     "Maksimum 6 kişilik küçük gruplar",
//     "Her ekipman seans öncesi dezenfekte edilir",
//     "Sertifikalı eğitmen kadrosu",
//     "Bireysel postür değerlendirmesi",
//   ]}
// />

import Reveal from "@/components/motion/Reveal";

export type StandardsBlockProps = {
  title: string;
  image: string;
  bullets: string[];
};

export default function StandardsBlock({ title, image, bullets }: StandardsBlockProps) {
  return (
    <section className="px-[var(--pad-x)] py-[var(--pad-y)] bg-secondary">
      <Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="aspect-[4/5] overflow-hidden">
            <img
              src={image}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="inline-flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent font-semibold">
              <span aria-hidden className="block w-8 h-px bg-vc-accent" />
              STANDARTLARIMIZ
            </span>
            <h2 className="font-serif text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] tracking-[-0.02em] mt-4 max-w-[18ch]">
              {title}
            </h2>
            <ul className="mt-8 divide-y divide-border">
              {bullets.map((bullet, i) => (
                <li key={i} className="py-4 flex items-start gap-4">
                  <span className="text-vc-accent font-mono text-sm tabular-nums w-8 shrink-0 font-semibold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-foreground/85">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
