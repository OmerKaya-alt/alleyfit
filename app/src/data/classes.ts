import { images } from "./images";
import type { Lang } from "@/lib/lang";

type I18n = { tr: string; en: string };

export type Klass = {
  slug: "reformer" | "mat" | "cadillac" | "spinning" | "prenatal" | "ozel";
  title: I18n;
  description: I18n;
  image: string;
  duration: I18n;
  level: I18n;
  format: I18n;
};

export const classes: Klass[] = [
  {
    slug: "reformer",
    title: { tr: "Reformer", en: "Reformer" },
    description: {
      tr: "Yay direnci üzerinde tüm vücudu çalıştıran kontrollü, akışkan bir disiplin.",
      en: "Full-body discipline with controlled, fluid spring resistance.",
    },
    image: images.portrait.reformer,
    duration: { tr: "50 dk", en: "50 min" },
    level: { tr: "Tüm Seviyeler", en: "All Levels" },
    format: { tr: "Grup · max 6 kişi", en: "Group · max 6 people" },
  },
  {
    slug: "mat",
    title: { tr: "Mat Pilates", en: "Mat Pilates" },
    description: {
      tr: "Yer minderinde, kendi ağırlığınla omurgayı yeniden hizalayan klasik temel.",
      en: "Classic foundation on a mat, realigning the spine with your own weight.",
    },
    image: images.portrait.mat,
    duration: { tr: "50 dk", en: "50 min" },
    level: { tr: "Başlangıç", en: "Beginner" },
    format: { tr: "Grup · max 6 kişi", en: "Group · max 6 people" },
  },
  {
    slug: "cadillac",
    title: { tr: "Cadillac", en: "Cadillac" },
    description: {
      tr: "Yaylı sistem ve barlarla derin postür çalışması — özel oda akışı.",
      en: "Deep postural work with springs and bars — private room flow.",
    },
    image: images.portrait.barre,
    duration: { tr: "50 dk", en: "50 min" },
    level: { tr: "Orta", en: "Intermediate" },
    format: {
      tr: "Birebir & 2 kişilik özel oda · Cadillac, Barrel, Chair, Reformer",
      en: "1:1 & 2-person private room · Cadillac, Barrel, Chair, Reformer",
    },
  },
  {
    slug: "spinning",
    title: { tr: "Spinning", en: "Spinning" },
    description: {
      tr: "Yüksek tempolu bisiklet seansı — enerjik, kararlı, ritim odaklı bir akış.",
      en: "High-tempo cycling session — energetic, steady, rhythm-driven flow.",
    },
    image: images.portrait.studio2,
    duration: { tr: "45 dk", en: "45 min" },
    level: { tr: "Tüm Seviyeler", en: "All Levels" },
    format: {
      tr: "Grup · 12 kişilik özel salon",
      en: "Group · 12-person private studio",
    },
  },
  {
    slug: "prenatal",
    title: { tr: "Prenatal", en: "Prenatal" },
    description: {
      tr: "Hamilelik döneminde gövdeyi destekleyen yumuşak ve güvenli akış.",
      en: "Gentle and safe flow that supports the body during pregnancy.",
    },
    image: images.portrait.prenatal,
    duration: { tr: "50 dk", en: "50 min" },
    level: { tr: "Tüm Seviyeler", en: "All Levels" },
    format: {
      tr: "Kişiye özel · küçük grup",
      en: "Personalized · small group",
    },
  },
  {
    slug: "ozel",
    title: { tr: "Özel Seans", en: "Private Session" },
    description: {
      tr: "Yalnızca sana özel hedef-odaklı birebir antrenman.",
      en: "Goal-focused 1:1 training, tailored solely to you.",
    },
    image: images.portrait.private,
    duration: { tr: "60 dk", en: "60 min" },
    level: { tr: "Tüm Seviyeler", en: "All Levels" },
    format: {
      tr: "Birebir özel seans",
      en: "1:1 private session",
    },
  },
];

/** Helper: lang seçimine göre düz nesne döndürür. */
export function localizeKlass(k: Klass, lang: Lang) {
  return {
    slug: k.slug,
    title: k.title[lang],
    description: k.description[lang],
    image: k.image,
    duration: k.duration[lang],
    level: k.level[lang],
    format: k.format[lang],
  };
}
