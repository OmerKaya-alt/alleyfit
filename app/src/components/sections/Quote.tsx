// Vibecycle-pattern Quote — koyu zeminde italic serif blockquote.
// Üst ve alt 12×1px ayraç çizgi ile çerçevelenir.
//
// Kullanım:
// <Quote
//   text="Pilates, sadece bir egzersiz değil; bedenle kurulan bir diyalogdur."
//   author="Joseph Pilates"
// />

import Reveal from "@/components/motion/Reveal";

export type QuoteProps = {
  text: string;
  author?: string;
};

export default function Quote({ text, author }: QuoteProps) {
  return (
    <section className="bg-foreground text-background px-[var(--pad-x)] py-[var(--pad-y)]">
      <Reveal>
        <div className="max-w-[60ch] mx-auto text-center">
          <span className="block w-12 h-px bg-background/40 mx-auto" aria-hidden="true" />
          <blockquote className="font-serif italic text-[clamp(1.6rem,3vw,2.8rem)] leading-[1.25] tracking-[-0.01em] my-10">
            &ldquo;{text}&rdquo;
          </blockquote>
          {author ? (
            <cite className="block text-[0.7rem] uppercase tracking-[0.22em] text-background/60 not-italic mt-4">
              &mdash; {author}
            </cite>
          ) : null}
          <span className="block w-12 h-px bg-background/40 mx-auto mt-10" aria-hidden="true" />
        </div>
      </Reveal>
    </section>
  );
}
