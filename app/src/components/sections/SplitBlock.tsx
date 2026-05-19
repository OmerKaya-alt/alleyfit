// Vibecycle-pattern SplitBlock — 50/50 görsel + metin yan yana.
// flip ile sıralama tersine çevrilir. Görsel 4/5 aspect, hover'da hafif zoom.
//
// Kullanım:
// <SplitBlock
//   image="https://..."
//   eyebrow="STÜDYOMUZ"
//   title="Bedeniniz için bir sığınak."
//   body="Şişli'nin merkezinde, doğal ışık alan ferah salonumuzda…"
//   cta={{ label: "DERSLERİMİZ", href: "/dersler" }}
//   flip
// />

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

export type SplitBlockProps = {
  image: string;
  alt?: string;
  eyebrow: string;
  title: string;
  body: string;
  cta?: { label: string; href: string };
  /** true → md+ ekranlarda görsel sağa, metin sola. */
  flip?: boolean;
  className?: string;
};

export default function SplitBlock({
  image,
  alt,
  eyebrow,
  title,
  body,
  cta,
  flip = false,
  className,
}: SplitBlockProps) {
  return (
    <section className={cn("px-[var(--pad-x)] py-[var(--pad-y)]", className)}>
      <Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-center">
          {/* Image side */}
          <div
            className={cn(
              "relative aspect-[4/5] overflow-hidden bg-muted group",
              flip ? "md:order-2" : "md:order-1",
            )}
          >
            <img
              src={image}
              alt={alt ?? ""}
              loading="lazy"
              className="w-full h-full object-cover transition-transform [transition-duration:600ms] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-[1.04]"
            />
            {/* Hover'da hafif rose tint — premium sıcak akord */}
            <div
              aria-hidden
              className="absolute inset-0 bg-vc-accent opacity-0 group-hover:opacity-15 transition-opacity duration-500 pointer-events-none mix-blend-multiply"
            />
          </div>

          {/* Text side */}
          <div className={cn(flip ? "md:order-1" : "md:order-2")}>
            <span className="inline-flex items-center gap-3 text-[0.88rem] uppercase tracking-[0.2em] text-vc-accent font-semibold">
              <span aria-hidden className="block w-10 h-px bg-vc-accent" />
              {eyebrow}
            </span>
            <h2 className="font-serif text-[clamp(3rem,6.8vw,6.2rem)] leading-[1.02] tracking-[-0.025em] mt-5 max-w-[16ch] font-medium [text-shadow:0_1px_2px_rgba(42,32,24,0.08)]">
              {title}
            </h2>
            <p className="text-foreground/75 text-[1rem] leading-relaxed mt-5 max-w-[42ch]">
              {body}
            </p>
            {cta ? (
              <Link
                to={cta.href}
                className="group inline-flex items-center gap-2 mt-8 text-[0.78rem] uppercase tracking-[0.18em] font-semibold border-b border-foreground/30 pb-1 hover:border-foreground transition"
              >
                {cta.label}
                <ArrowRight strokeWidth={1.5} className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : null}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
