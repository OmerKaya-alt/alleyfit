// Vibecycle-pattern CTABanner — full-width arka plan görseli + koyu overlay + ortalanmış başlık + CTA.
// 72vh yükseklik, min 480px. Beyaz buton (background ton) + ArrowRight ikonu.
//
// Kullanım:
// <CTABanner
//   image="https://…"
//   title="İlk seansınız bizden."
//   cta={{ label: "REZERVASYON", href: "/iletisim" }}
// />

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export type CTABannerProps = {
  image: string;
  title: string;
  cta?: { label: string; href: string };
};

export default function CTABanner({ image, title, cta }: CTABannerProps) {
  return (
    <section className="relative h-[72vh] min-h-[480px] overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={image}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover scale-110"
          style={{ filter: "blur(4px) brightness(0.5) saturate(0.85)" }}
        />
      </div>
      <div className="absolute inset-0 bg-foreground/40" aria-hidden="true" />
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-[var(--pad-x)]">
        <h2 className="font-serif text-[clamp(2.4rem,5vw,5rem)] leading-[1.05] tracking-[-0.02em] text-white max-w-[20ch] [text-shadow:0_2px_30px_rgba(0,0,0,0.65)]">
          {title}
        </h2>
        {cta ? (
          <Link
            to={cta.href}
            className="inline-flex items-center gap-2 mt-8 rounded-none bg-white text-black px-8 py-4 text-[0.78rem] uppercase tracking-[0.18em] font-semibold hover:bg-white/90 hover:-translate-y-0.5 transition"
          >
            {cta.label}
            <ArrowRight strokeWidth={1.5} className="w-4 h-4" />
          </Link>
        ) : null}
      </div>
    </section>
  );
}
