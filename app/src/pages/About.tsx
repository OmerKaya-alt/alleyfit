import Hero from "@/components/sections/Hero";
import SplitBlock from "@/components/sections/SplitBlock";
import Quote from "@/components/sections/Quote";
import StandardsBlock from "@/components/sections/StandardsBlock";
import CTABanner from "@/components/sections/CTABanner";
import { TRAINER } from "@/data/trainers";
import { images } from "@/data/images";
import { useLang } from "@/lib/lang";

export default function About() {
  const { t, lang } = useLang();
  return (
    <>
      <Hero
        eyebrow={t("about.eyebrow")}
        title={t("about.title")}
        subtitle={t("about.subtitle")}
        image={images.hero.aboutWide}
        ctaPrimary={{ label: t("about.cta"), href: "#egitmen" }}
        height="medium"
      />

      <SplitBlock
        image={images.portrait.studio2}
        eyebrow={t("about.story.eyebrow")}
        title={t("about.story.title")}
        body={t("about.story.body")}
        alt={t("about.story.title")}
        cta={{ label: t("about.story.cta"), href: "/dersler" }}
      />

      <SplitBlock
        flip
        image={images.portrait.studio1}
        eyebrow={t("about.philosophy.eyebrow")}
        title={t("about.philosophy.title")}
        body={t("about.philosophy.body")}
      />

      {/* Tek eğitmen — kurucu */}
      <div id="egitmen" />
      <SplitBlock
        image={TRAINER.image}
        eyebrow={`${t("about.trainer.eyebrowPrefix")} · ${TRAINER.role[lang]}`}
        title={TRAINER.name}
        body={TRAINER.bio[lang]}
        cta={{ label: t("about.trainer.cta"), href: "/program" }}
      />

      <Quote text={t("about.quote.text")} author={t("about.quote.author")} />

      <StandardsBlock
        title={t("about.standards.title")}
        image={images.portrait.standards}
        bullets={[
          t("studio.standards.bullet1"),
          t("studio.standards.bullet2"),
          t("studio.standards.bullet3"),
          t("studio.standards.bullet4"),
          t("studio.standards.bullet5"),
        ]}
      />

      <CTABanner
        image={images.hero.classesWide}
        title={t("about.banner.title")}
        cta={{ label: t("about.banner.cta"), href: "/program" }}
      />
    </>
  );
}
