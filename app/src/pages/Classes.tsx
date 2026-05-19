import Hero from "@/components/sections/Hero";
import SplitBlock from "@/components/sections/SplitBlock";
import Quote from "@/components/sections/Quote";
import CTABanner from "@/components/sections/CTABanner";
import { classes } from "@/data/classes";
import { images } from "@/data/images";
import { useLang } from "@/lib/lang";

export default function Classes() {
  const { t, lang } = useLang();
  return (
    <>
      <Hero
        eyebrow={t("classes.eyebrow")}
        title={t("classes.title")}
        subtitle={t("classes.subtitle")}
        image={images.hero.classesWide}
        ctaPrimary={{ label: t("classes.cta"), href: "/program" }}
        height="medium"
      />

      {classes.map((k, i) => {
        const title = k.title[lang];
        const duration = k.duration[lang];
        const format = k.format[lang];
        return (
          <SplitBlock
            key={k.slug}
            flip={i % 2 === 1}
            image={k.image}
            eyebrow={`${title.toUpperCase()} · ${duration} · ${format}`}
            title={title}
            body={k.description[lang]}
            cta={{ label: t("classes.split.cta"), href: "/program" }}
          />
        );
      })}

      <Quote text={t("classes.quote.text")} author={t("classes.quote.author")} />

      <CTABanner
        image={images.hero.scheduleWide}
        title={t("classes.banner.title")}
        cta={{ label: t("classes.banner.cta"), href: "/program" }}
      />
    </>
  );
}
