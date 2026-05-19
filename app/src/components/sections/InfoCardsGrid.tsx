// Vibecycle-pattern InfoCardsGrid — muted zeminde 2 veya 3 sütun kart ızgarası.
// Her kart: opsiyonel kare görsel + başlık + body.
//
// Kullanım:
// <InfoCardsGrid columns={3} items={[
//   { title: "Reformer", body: "Yaylı sistemle güç ve denge…", image: "https://…" },
//   { title: "Mat", body: "Klasik yer çalışması…", image: "https://…" },
//   { title: "Prenatal", body: "Hamilelik dönemi için…", image: "https://…" },
// ]} />

import Reveal from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

export type InfoCardsItem = {
  title: string;
  body: string;
  image?: string;
};

export type InfoCardsGridProps = {
  items: InfoCardsItem[];
  columns?: 2 | 3;
};

export default function InfoCardsGrid({ items, columns = 3 }: InfoCardsGridProps) {
  return (
    <section className="px-[var(--pad-x)] py-[var(--pad-y)] bg-muted">
      <Reveal>
        <div
          className={cn(
            "grid grid-cols-1 gap-8",
            columns === 2 ? "md:grid-cols-2" : "md:grid-cols-3",
          )}
        >
          {items.map((item, i) => (
            <article key={i} className="bg-background p-8 md:p-10">
              {item.image ? (
                <div className="aspect-square overflow-hidden mb-6">
                  <img
                    src={item.image}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : null}
              <h3 className="font-serif text-[clamp(1.4rem,2vw,2rem)] tracking-[-0.01em]">
                {item.title}
              </h3>
              <p className="text-foreground/75 text-[0.95rem] leading-relaxed mt-3">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
