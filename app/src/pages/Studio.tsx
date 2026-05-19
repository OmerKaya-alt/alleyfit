import Hero from "@/components/sections/Hero";
import Ticker from "@/components/sections/Ticker";
import SplitBlock from "@/components/sections/SplitBlock";
import StatsBar from "@/components/sections/StatsBar";
import Quote from "@/components/sections/Quote";
import StepGrid from "@/components/sections/StepGrid";
import InfoCardsGrid from "@/components/sections/InfoCardsGrid";
import StandardsBlock from "@/components/sections/StandardsBlock";
import CTABanner from "@/components/sections/CTABanner";
import { images } from "@/data/images";
import { useLang } from "@/lib/lang";

export default function Studio() {
  const { t } = useLang();
  return (
    <>
      <Hero
        eyebrow={t("studio.eyebrow")}
        title={t("studio.title")}
        subtitle={t("studio.subtitle")}
        image={images.hero.studio}
        ctaPrimary={{ label: t("studio.cta1"), href: "/program" }}
        ctaSecondary={{ label: t("studio.cta2"), href: "/dersler" }}
        height="full"
      />

      <Ticker
        items={[
          "REFORMER",
          "MAT PILATES",
          "CADILLAC",
          "SPINNING",
          "PRENATAL",
          "ÖZEL SEANS",
        ]}
      />

      <SplitBlock
        image={images.portrait.reformer}
        eyebrow={t("studio.split1.eyebrow")}
        title={t("studio.split1.title")}
        body={t("studio.split1.body")}
        cta={{ label: t("studio.split1.cta"), href: "/dersler#reformer" }}
      />

      <SplitBlock
        flip
        image={images.portrait.mat}
        eyebrow={t("studio.split2.eyebrow")}
        title={t("studio.split2.title")}
        body={t("studio.split2.body")}
        cta={{ label: t("studio.split2.cta"), href: "/dersler#mat" }}
      />

      <StatsBar
        items={[
          { value: 500, suffix: "+", label: t("studio.stats.member") },
          { value: 5, suffix: "+", label: t("studio.stats.discipline") },
          { value: 8, label: t("studio.stats.daily") },
          { value: 3, label: t("studio.stats.room") },
        ]}
      />

      <StepGrid
        items={[
          { n: "01", title: t("studio.steps.1.title"), body: t("studio.steps.1.body") },
          { n: "02", title: t("studio.steps.2.title"), body: t("studio.steps.2.body") },
          { n: "03", title: t("studio.steps.3.title"), body: t("studio.steps.3.body") },
          { n: "04", title: t("studio.steps.4.title"), body: t("studio.steps.4.body") },
          { n: "05", title: t("studio.steps.5.title"), body: t("studio.steps.5.body") },
        ]}
      />

      <Quote text={t("studio.quote.text")} author={t("studio.quote.author")} />

      <StandardsBlock
        title={t("studio.standards.title")}
        image={images.portrait.standards}
        bullets={[
          t("studio.standards.bullet1"),
          t("studio.standards.bullet2"),
          t("studio.standards.bullet3"),
          t("studio.standards.bullet4"),
          t("studio.standards.bullet5"),
        ]}
      />

      <InfoCardsGrid
        columns={3}
        items={[
          {
            title: t("studio.info.1.title"),
            body: t("studio.info.1.body"),
            image: images.square.detail1,
          },
          {
            title: t("studio.info.2.title"),
            body: t("studio.info.2.body"),
            image: images.square.detail2,
          },
          {
            title: t("studio.info.3.title"),
            body: t("studio.info.3.body"),
            image: images.square.detail3,
          },
        ]}
      />

      <CTABanner
        image={images.hero.classesWide}
        title={t("studio.banner.title")}
        cta={{ label: t("studio.banner.cta"), href: "/program" }}
      />
    </>
  );
}
