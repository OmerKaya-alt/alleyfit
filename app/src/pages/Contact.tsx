import Hero from "@/components/sections/Hero";
import { MapPin, Phone, Mail, MessageCircle, ArrowRight } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import { images } from "@/data/images";
import { useLang } from "@/lib/lang";

export default function Contact() {
  const { t } = useLang();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("contact-submit");
  }

  return (
    <>
      <Hero
        eyebrow={t("contact.eyebrow")}
        title={t("contact.title")}
        subtitle={t("contact.subtitle")}
        image={images.hero.contactWide}
        ctaPrimary={{ label: t("contact.cta"), href: "https://wa.me/905366711793" }}
        height="medium"
      />

      <section className="px-[var(--pad-x)] py-[var(--pad-y)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-site mx-auto">
          {/* Sol: harita */}
          <Reveal>
            <div className="aspect-[4/3] lg:aspect-[3/4] overflow-hidden bg-muted">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3010.123!2d28.987!3d41.060!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab7650ab73473%3A0x4a0a17db5ed1b25e!2zxZ7DvHRsw7w!5e0!3m2!1str!2str!4v1700000000000"
                width="100%"
                height="100%"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Alleyfit Pilates konum"
                className="border-0 grayscale"
              />
            </div>
          </Reveal>

          {/* Sağ: bilgi bloğu */}
          <Reveal delay={0.15}>
            <span className="block text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent font-medium">{t("contact.reach.eyebrow")}</span>
            <h2 className="font-serif text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] tracking-[-0.02em] mt-4 max-w-[18ch]">{t("contact.reach.title")}</h2>

            <ul className="mt-10 space-y-6">
              <li className="flex items-start gap-4">
                <MapPin strokeWidth={1.5} className="w-5 h-5 mt-1 text-foreground/60 shrink-0" />
                <div>
                  <span className="text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent">{t("contact.address")}</span>
                  <p className="font-serif text-[1.2rem] tracking-[-0.01em] mt-1">{t("contact.addressLine1")}<br/>{t("contact.addressLine2")}</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <Phone strokeWidth={1.5} className="w-5 h-5 mt-1 text-foreground/60 shrink-0" />
                <div>
                  <span className="text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent">{t("contact.phone")}</span>
                  <a href="tel:+905366711793" className="block font-serif text-[1.2rem] mt-1 hover:opacity-70 transition">+90 536 671 17 93</a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <Mail strokeWidth={1.5} className="w-5 h-5 mt-1 text-foreground/60 shrink-0" />
                <div>
                  <span className="text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent">{t("contact.email")}</span>
                  <a href="mailto:merhaba@alleyfit.com" className="block font-serif text-[1.2rem] mt-1 hover:opacity-70 transition">merhaba@alleyfit.com</a>
                </div>
              </li>
            </ul>

            <a
              href="https://wa.me/905366711793"
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 mt-10 rounded-none bg-foreground text-background px-7 py-4 text-[0.78rem] uppercase tracking-[0.18em] font-medium hover:opacity-90 transition"
            >
              <MessageCircle strokeWidth={1.5} className="w-4 h-4" />
              {t("contact.whatsapp")}
            </a>
          </Reveal>
        </div>
      </section>

      {/* Form */}
      <section className="px-[var(--pad-x)] py-[var(--pad-y)] bg-muted">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-site mx-auto">
          <Reveal>
            <span className="block text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent font-medium">{t("contact.form.eyebrow")}</span>
            <h2 className="font-serif text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] tracking-[-0.02em] mt-4 max-w-[16ch]">{t("contact.form.title")}</h2>
            <p className="text-foreground/70 leading-relaxed mt-6 max-w-[40ch]">{t("contact.form.lead")}</p>
          </Reveal>

          <Reveal delay={0.15}>
            <form action="https://formspree.io/f/xxxxxxx" method="POST" onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <label className="block">
                  <span className="text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent">{t("contact.form.name")}</span>
                  <input type="text" name="name" required className="mt-2 w-full bg-transparent border-b border-foreground/30 py-3 focus:border-foreground outline-none transition" />
                </label>
                <label className="block">
                  <span className="text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent">{t("contact.form.email")}</span>
                  <input type="email" name="email" required className="mt-2 w-full bg-transparent border-b border-foreground/30 py-3 focus:border-foreground outline-none transition" />
                </label>
              </div>
              <label className="block">
                <span className="text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent">{t("contact.form.message")}</span>
                <textarea name="message" rows={5} required className="mt-2 w-full bg-transparent border-b border-foreground/30 py-3 focus:border-foreground outline-none transition resize-none" />
              </label>
              <button type="submit" className="inline-flex items-center gap-2 rounded-none bg-foreground text-background px-7 py-4 text-[0.78rem] uppercase tracking-[0.18em] font-medium hover:opacity-90 transition">
                {t("contact.form.send")} <ArrowRight strokeWidth={1.5} className="w-4 h-4" />
              </button>
            </form>
          </Reveal>
        </div>
      </section>
    </>
  );
}
