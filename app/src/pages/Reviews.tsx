import { Star, ArrowUpRight } from "lucide-react";

import Hero from "@/components/sections/Hero";
import Quote from "@/components/sections/Quote";
import CTABanner from "@/components/sections/CTABanner";
import Reveal from "@/components/motion/Reveal";
import { reviews, reviewStats, GOOGLE_REVIEWS_URL } from "@/data/reviews";
import { images } from "@/data/images";
import { useLang } from "@/lib/lang";

export default function Reviews() {
  const { t } = useLang();
  return (
    <>
      <Hero
        eyebrow={t("reviews.eyebrow")}
        title={t("reviews.title")}
        subtitle={t("reviews.subtitle")}
        image={images.hero.aboutWide}
        ctaPrimary={{ label: t("reviews.cta"), href: GOOGLE_REVIEWS_URL }}
        height="medium"
      />

      {/* Stats — özet rakamlar */}
      <section className="px-[var(--pad-x)] py-[clamp(60px,10vw,140px)] bg-background border-y border-border">
        <Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-12 gap-x-8 max-w-site mx-auto">
            <div className="text-center md:text-left">
              <h3 className="font-serif text-[clamp(2.6rem,5vw,5rem)] leading-[0.95] tracking-[-0.02em]">
                {reviewStats.rating}
                <span className="text-foreground/40">/5</span>
              </h3>
              <span className="inline-flex items-center gap-3 mt-4 text-[0.95rem] uppercase tracking-[0.18em] text-vc-accent font-semibold">
                <span aria-hidden className="block w-8 h-px bg-vc-accent" />
                {t("reviews.stats.rating")}
              </span>
            </div>
            <div className="text-center md:text-left">
              <h3 className="font-serif text-[clamp(2.6rem,5vw,5rem)] leading-[0.95] tracking-[-0.02em]">
                {reviewStats.count}
              </h3>
              <span className="inline-flex items-center gap-3 mt-4 text-[0.95rem] uppercase tracking-[0.18em] text-vc-accent font-semibold">
                <span aria-hidden className="block w-8 h-px bg-vc-accent" />
                {t("reviews.stats.count")}
              </span>
            </div>
            <div className="text-center md:text-left">
              <h3 className="font-serif text-[clamp(2.6rem,5vw,5rem)] leading-[0.95] tracking-[-0.02em]">
                %{reviewStats.satisfactionPercent}
              </h3>
              <span className="inline-flex items-center gap-3 mt-4 text-[0.95rem] uppercase tracking-[0.18em] text-vc-accent font-semibold">
                <span aria-hidden className="block w-8 h-px bg-vc-accent" />
                {t("reviews.stats.satisfaction")}
              </span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Öne çıkan yorum */}
      <Quote text={reviews[0].text} author={reviews[0].name} />

      {/* Yorum kartları grid */}
      <section className="px-[var(--pad-x)] py-[var(--pad-y)]">
        <div className="max-w-site mx-auto">
          <span className="inline-flex items-center gap-3 text-[0.88rem] uppercase tracking-[0.2em] text-vc-accent font-semibold">
            <span aria-hidden className="block w-10 h-px bg-vc-accent" />
            {t("reviews.section.eyebrow")}
          </span>
          <h2 className="font-serif text-[clamp(2.4rem,5vw,5rem)] leading-[1.05] tracking-[-0.025em] mt-5 max-w-[22ch] font-medium">
            {t("reviews.section.title")}
          </h2>

          <Reveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
            {reviews.map((r, i) => (
              <article
                key={i}
                className="bg-secondary border border-border p-8 transition-colors hover:border-vc-accent/40 flex flex-col"
              >
                <header className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center font-semibold text-sm bg-vc-accent/15 text-vc-accent"
                    aria-hidden
                  >
                    {r.initials}
                  </div>
                  <div className="leading-tight">
                    <h4 className="font-medium text-[0.95rem]">{r.name}</h4>
                    <span className="text-[0.72rem] text-foreground/50">{r.daysAgo}</span>
                  </div>
                </header>

                <div className="mt-5 flex gap-0.5" aria-label={`${r.rating} yıldız`}>
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      strokeWidth={1.5}
                      className={
                        idx < r.rating
                          ? "w-4 h-4 fill-vc-accent text-vc-accent"
                          : "w-4 h-4 text-foreground/20"
                      }
                    />
                  ))}
                </div>

                <p className="mt-4 text-foreground/80 text-[0.95rem] leading-relaxed">
                  {r.text}
                </p>
              </article>
            ))}
          </Reveal>

          {/* Google'a yönlendirme */}
          <div className="mt-14 text-center">
            <a
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 text-[0.88rem] uppercase tracking-[0.2em] font-semibold border-b border-foreground/30 pb-1 hover:border-foreground transition"
            >
              {t("reviews.viewAll")}
              <ArrowUpRight
                strokeWidth={1.5}
                className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </a>
          </div>
        </div>
      </section>

      <CTABanner
        image={images.hero.studio}
        title={t("reviews.banner.title")}
        cta={{ label: t("reviews.banner.cta"), href: "/program" }}
      />
    </>
  );
}
