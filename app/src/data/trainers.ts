import { images } from "./images";

type I18n = { tr: string; en: string };

export type Trainer = {
  name: string;
  role: I18n;
  image: string;
  bio: I18n;
};

// Alleyfit Wellness Studio — tek eğitmen / sahip.
export const trainers: Trainer[] = [
  {
    name: "Aleyna",
    role: {
      tr: "Reformer · Mat · Cadillac · Spinning · Prenatal · Özel",
      en: "Reformer · Mat · Cadillac · Spinning · Prenatal · Private",
    },
    // Stüdyo / ekipman görseli — anonim stok portre değil.
    // Aleyna'nın gerçek fotoğrafı geldiğinde public/photos/ altına konup buradan bağlanabilir.
    image: images.portrait.reformer,
    bio: {
      tr: "Okul yıllarında kilo verme yolculuğunda pilatesle tanıştı. Zaman içinde bu disiplini bir spordan öte bir yaşam biçimine dönüştürdü — bugün Şile'deki stüdyosunda kendi hikayesini başkalarıyla paylaşıyor.",
      en: "She discovered pilates during a weight-loss journey in her school years. Over time, she turned this discipline from a sport into a way of life — today she shares her story with others at her studio in Şile.",
    },
  },
];

export const TRAINER = trainers[0];
