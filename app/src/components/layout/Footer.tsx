import { useState, type FormEvent, type SVGProps } from "react";
import { Link } from "react-router-dom";
import { Mail, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Reveal from "@/components/motion/Reveal";
import { useLang } from "@/lib/lang";

/* ------------------------------------------------------------------ */
/*  Inline brand glyphs — lucide-react 1.14.0 doesn't ship Instagram /*/
/*  Facebook icons; strokeWidth=1.5 to match the rest of the system.  */
/* ------------------------------------------------------------------ */

function InstagramGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={16}
      height={16}
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

function FacebookGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={16}
      height={16}
      aria-hidden="true"
      {...props}
    >
      <path d="M14 4h-1.5A2.5 2.5 0 0 0 10 6.5V9H8v3h2v8h3v-8h2.2l.4-3H13V7a1 1 0 0 1 1-1h1V4z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Link data                                                          */
/* ------------------------------------------------------------------ */

const studioLinks: Array<{ label: string; to: string }> = [
  { label: "Hakkımızda", to: "/hakkimizda" },
  { label: "Dersler", to: "/dersler" },
  { label: "Eğitmenler", to: "/hakkimizda#egitmen" },
  { label: "Kurumsal", to: "/kurumsal" },
];

const programLinks: Array<{ label: string; to: string }> = [
  { label: "Reformer", to: "/dersler#reformer" },
  { label: "Mat Pilates", to: "/dersler#mat-pilates" },
  { label: "Barre", to: "/dersler#barre" },
  { label: "Prenatal", to: "/dersler#prenatal" },
  { label: "Özel Seans", to: "/dersler#ozel-seans" },
];


/* ------------------------------------------------------------------ */
/*  Footer                                                              */
/* ------------------------------------------------------------------ */

export default function Footer() {
  const [email, setEmail] = useState("");
  const { t } = useLang();

  const handleSubscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // eslint-disable-next-line no-console
    console.log("subscribe", email);
    setEmail("");
  };

  const colTitle =
    "font-sans text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent font-semibold";
  const colLink =
    "text-[0.92rem] text-background/80 hover:text-background transition";
  const socialBtn =
    "rounded-full border border-background/30 p-2.5 text-background/80 hover:border-background hover:text-background hover:bg-background/10 transition";

  return (
    <footer
      className={cn(
        "relative overflow-hidden border-t border-foreground/10",
        "bg-foreground text-background",
      )}
      style={{
        paddingLeft: "var(--pad-x)",
        paddingRight: "var(--pad-x)",
        paddingTop: "clamp(80px, 12vw, 160px)",
        paddingBottom: "3rem",
      }}
    >
      {/* ------------------- ÜST BLOK ------------------- */}
      <Reveal>
        <div className="relative z-10 grid grid-cols-12 gap-8">
          {/* Bülten kayıt */}
          <div className="col-span-12 md:col-span-4">
            <span className="inline-flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent font-semibold">
              <span aria-hidden className="block w-8 h-px bg-vc-accent" />
              {t("footer.newsletter")}
            </span>
            <h3 className="font-serif mt-3 text-[clamp(1.6rem,2.4vw,2.4rem)] leading-tight">
              {t("footer.newsletterH3")}
            </h3>

            <form onSubmit={handleSubscribe} className="mt-6 flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta adresiniz"
                aria-label="E-posta adresiniz"
                className={cn(
                  "flex-1 rounded-none border border-background/30 bg-transparent",
                  "px-4 py-3 text-sm placeholder-background/40",
                  "focus:border-background focus:outline-none transition",
                )}
              />
              <button
                type="submit"
                className={cn(
                  "rounded-none bg-background text-foreground",
                  "px-6 py-3 text-[0.78rem] uppercase tracking-[0.18em] font-medium",
                  "hover:bg-background/90 transition",
                )}
              >
                {t("footer.subscribe")}
              </button>
            </form>

            <p className="mt-3 text-[0.7rem] text-background/50">
              {t("footer.subscribeNote")}
            </p>
          </div>

          {/* STÜDYO */}
          <div className="col-span-6 md:col-span-2">
            <h4 className={colTitle}>{t("footer.studio")}</h4>
            <ul className="mt-4 space-y-2">
              {studioLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className={colLink}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* PROGRAM */}
          <div className="col-span-6 md:col-span-2">
            <h4 className={colTitle}>{t("footer.program")}</h4>
            <ul className="mt-4 space-y-2">
              {programLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className={colLink}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* İLETİŞİM */}
          <div className="col-span-12 md:col-span-4">
            <h4 className={colTitle}>{t("footer.contact")}</h4>

            <address className="not-italic mt-4 font-serif text-[1.05rem] leading-relaxed text-background/85">
              Şile Merkez
              <br />
              İstanbul
            </address>

            <a
              href="tel:+905366711793"
              className="block mt-4 text-[0.92rem] text-background/80 hover:text-background transition"
            >
              +90 536 671 17 93
            </a>
            <a
              href="mailto:merhaba@alleyfit.com"
              className="block text-[0.92rem] text-background/80 hover:text-background transition"
            >
              merhaba@alleyfit.com
            </a>

            <div className="mt-6 flex gap-3">
              <a
                href="https://instagram.com/alleyfit"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className={socialBtn}
              >
                <InstagramGlyph />
              </a>
              <a
                href="https://facebook.com/alleyfit"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className={socialBtn}
              >
                <FacebookGlyph />
              </a>
              <a
                href="https://wa.me/905366711793"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className={socialBtn}
              >
                <MessageCircle size={16} strokeWidth={1.5} aria-hidden="true" />
              </a>
              <a
                href="mailto:merhaba@alleyfit.com"
                aria-label="E-posta"
                className={socialBtn}
              >
                <Mail size={16} strokeWidth={1.5} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ------------------- ALT BAR ------------------- */}
      <Reveal>
        <div
          className={cn(
            "relative z-10 pt-8 border-t border-background/10",
            "flex flex-col md:flex-row md:items-center md:justify-between gap-4",
            "text-[0.7rem] uppercase tracking-[0.18em] text-background/50",
          )}
          style={{ marginTop: "clamp(60px, 10vw, 120px)" }}
        >
          <span>{t("footer.copyright")}</span>
          <nav className="flex flex-wrap gap-6">
            <Link to="/kvkk" className="hover:text-background/80 transition">{t("footer.kvkk")}</Link>
            <Link to="/cerez-politikasi" className="hover:text-background/80 transition">{t("footer.cookies")}</Link>
            <Link to="/kullanim-sartlari" className="hover:text-background/80 transition">{t("footer.terms")}</Link>
          </nav>
        </div>
      </Reveal>

    </footer>
  );
}
