import Hero from "@/components/sections/Hero";
import InfoCardsGrid from "@/components/sections/InfoCardsGrid";
import StepGrid from "@/components/sections/StepGrid";
import Quote from "@/components/sections/Quote";
import CTABanner from "@/components/sections/CTABanner";
import Reveal from "@/components/motion/Reveal";
import { images } from "@/data/images";
import { useLang } from "@/lib/lang";

export default function Corporate() {
  const { t } = useLang();
  return (
    <>
      <Hero
        eyebrow={t("corporate.eyebrow")}
        title={t("corporate.title")}
        subtitle={t("corporate.subtitle")}
        image={images.hero.corporateWide}
        ctaPrimary={{ label: t("corporate.cta"), href: "/iletisim" }}
        height="medium"
      />

      <InfoCardsGrid
        columns={3}
        items={[
          { title: t("corporate.cards.1.title"), body: t("corporate.cards.1.body"), image: images.portrait.reformer },
          { title: t("corporate.cards.2.title"), body: t("corporate.cards.2.body"), image: images.portrait.mat },
          { title: t("corporate.cards.3.title"), body: t("corporate.cards.3.body"), image: images.portrait.barre },
        ]}
      />

      <StepGrid
        items={[
          { n: "01", title: t("corporate.steps.1.title"), body: t("corporate.steps.1.body") },
          { n: "02", title: t("corporate.steps.2.title"), body: t("corporate.steps.2.body") },
          { n: "03", title: t("corporate.steps.3.title"), body: t("corporate.steps.3.body") },
          { n: "04", title: t("corporate.steps.4.title"), body: t("corporate.steps.4.body") },
          { n: "05", title: t("corporate.steps.5.title"), body: t("corporate.steps.5.body") },
        ]}
      />

      {/* Logo grid (placeholder) */}
      <section className="px-[var(--pad-x)] py-[var(--pad-y)]">
        <div className="max-w-site mx-auto">
          <span className="block text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent font-medium">{t("corporate.logos.eyebrow")}</span>
          <Reveal>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-12 gap-y-10 mt-12 items-center">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/1] border border-border bg-muted flex items-center justify-center">
                  <span className="font-serif text-[1.2rem] tracking-[-0.01em] text-foreground/50">{t("corporate.logos.label")}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <Quote text={t("corporate.quote.text")} author={t("corporate.quote.author")} />

      <CTABanner
        image={images.hero.corporateWide}
        title={t("corporate.banner.title")}
        cta={{ label: t("corporate.banner.cta"), href: "/iletisim" }}
      />
    </>
  );
}
