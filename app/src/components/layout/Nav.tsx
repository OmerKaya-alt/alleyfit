import { useEffect, useId, useState, type SVGProps } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { useLang, type DictKey } from "@/lib/lang";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const WHATSAPP_HREF =
  "https://wa.me/905366711793?text=" +
  encodeURIComponent("Merhaba, Alleyfit Pilates hakkinda bilgi almak istiyorum.");
const INSTAGRAM_HREF = "https://www.instagram.com/alleyfitstudio/";

function WhatsAppGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <path
        fill="#25D366"
        d="M16 0c8.84 0 16 7.16 16 16s-7.16 16-16 16c-2.85 0-5.52-.74-7.84-2.05L0 32l2.13-7.97A15.93 15.93 0 0 1 0 16C0 7.16 7.16 0 16 0z"
      />
      <path
        fill="#fff"
        d="M11.05 9.4c-.27-.6-.55-.61-.81-.62-.21 0-.45-.01-.69-.01-.24 0-.62.09-.95.45-.32.36-1.24 1.21-1.24 2.95s1.27 3.42 1.45 3.66c.18.24 2.45 3.92 6.06 5.49 3 1.31 3.61 1.05 4.27.99.65-.06 2.11-.86 2.4-1.69.3-.83.3-1.55.21-1.69-.09-.15-.33-.24-.69-.42-.36-.18-2.11-1.04-2.44-1.16-.32-.12-.56-.18-.79.18-.24.36-.91 1.16-1.12 1.4-.21.24-.41.27-.77.09-.36-.18-1.51-.55-2.88-1.77-1.06-.95-1.78-2.12-1.99-2.48-.21-.36-.02-.55.16-.73.16-.16.36-.42.54-.63.18-.21.24-.36.36-.59.12-.24.06-.45-.03-.63-.09-.18-.79-1.93-1.09-2.65z"
      />
    </svg>
  );
}

function InstagramGlyph(props: SVGProps<SVGSVGElement>) {
  // Her instance kendi gradient ID'sini alır — aynı sayfada çakışma olmaz.
  const gid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id={gid} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FEDA75" />
          <stop offset="25%" stopColor="#FA7E1E" />
          <stop offset="50%" stopColor="#D62976" />
          <stop offset="75%" stopColor="#962FBF" />
          <stop offset="100%" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="7.5" ry="7.5" fill={`url(#${gid})`} />
      <circle cx="16" cy="16" r="5.4" fill="none" stroke="#fff" strokeWidth="2" />
      <circle cx="22.6" cy="9.4" r="1.4" fill="#fff" />
    </svg>
  );
}

function FlagTR(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <rect width="30" height="20" fill="#E30A17" />
      <circle cx="11.5" cy="10" r="4.2" fill="#fff" />
      <circle cx="12.6" cy="10" r="3.3" fill="#E30A17" />
      <polygon points="17.4,10 15.4,10.65 16.65,8.95 16.65,11.05 15.4,9.35" fill="#fff" />
    </svg>
  );
}

function FlagEN(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <rect width="30" height="20" fill="#012169" />
      <path d="M0 0 L30 20 M30 0 L0 20" stroke="#fff" strokeWidth="3" />
      <path d="M0 0 L30 20 M30 0 L0 20" stroke="#C8102E" strokeWidth="1.5" />
      <path d="M15 0 V20 M0 10 H30" stroke="#fff" strokeWidth="5" />
      <path d="M15 0 V20 M0 10 H30" stroke="#C8102E" strokeWidth="3" />
    </svg>
  );
}

function LangSwitcher() {
  const { lang, setLang } = useLang();
  const langBtn =
    "inline-flex items-center gap-1.5 font-sans text-[0.65rem] uppercase tracking-[0.18em] transition-colors duration-200";
  return (
    <div
      className="flex items-center gap-2 rounded-full border border-border bg-background/60 px-2.5 py-1.5 backdrop-blur"
      role="group"
      aria-label="Dil seçimi"
    >
      <button
        type="button"
        onClick={() => setLang("tr")}
        aria-pressed={lang === "tr"}
        className={cn(
          langBtn,
          lang === "tr" ? "font-medium text-foreground" : "text-foreground/40 hover:text-foreground/60",
        )}
      >
        <FlagTR className="h-[10px] w-4 rounded-[1px]" />
        TR
      </button>
      <span aria-hidden className="h-3 w-px bg-border" />
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={cn(
          langBtn,
          lang === "en" ? "font-medium text-foreground" : "text-foreground/40 hover:text-foreground/60",
        )}
      >
        <FlagEN className="h-[10px] w-4 rounded-[1px]" />
        EN
      </button>
    </div>
  );
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={cn("flex items-center min-w-0 leading-none", compact ? "gap-1.5" : "gap-2")}>
      <svg
        viewBox="0 0 100 110"
        className={compact ? "w-8 h-8 shrink-0 text-vc-accent" : "w-12 h-12 shrink-0 text-vc-accent"}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M 8 102 L 8 50 A 42 42 0 0 1 92 50 L 92 102" strokeWidth="2.4" />
        <line x1="50" y1="68" x2="50" y2="14" strokeWidth="2" />
        <line x1="50" y1="68" x2="36" y2="18" strokeWidth="2" />
        <line x1="50" y1="68" x2="64" y2="18" strokeWidth="2" />
        <line x1="50" y1="68" x2="22" y2="28" strokeWidth="2" />
        <line x1="50" y1="68" x2="78" y2="28" strokeWidth="2" />
        <line x1="50" y1="68" x2="12" y2="44" strokeWidth="2" />
        <line x1="50" y1="68" x2="88" y2="44" strokeWidth="2" />
        <line x1="50" y1="68" x2="44" y2="20" strokeWidth="1.8" strokeDasharray="3 3" />
        <line x1="50" y1="68" x2="56" y2="20" strokeWidth="1.8" strokeDasharray="3 3" />
        <line x1="50" y1="68" x2="30" y2="22" strokeWidth="1.8" strokeDasharray="3 3" />
        <line x1="50" y1="68" x2="70" y2="22" strokeWidth="1.8" strokeDasharray="3 3" />
        <line x1="50" y1="68" x2="16" y2="36" strokeWidth="1.8" strokeDasharray="3 3" />
        <line x1="50" y1="68" x2="84" y2="36" strokeWidth="1.8" strokeDasharray="3 3" />
        <circle cx="50" cy="78" r="16" strokeWidth="2.4" />
        <path d="M 40 86 Q 50 72 60 82 Q 64 88 56 92" strokeWidth="2.2" />
        <line x1="8" y1="102" x2="92" y2="102" strokeWidth="2.4" />
      </svg>
      <span className="flex min-w-0 flex-col leading-none">
        <span
          className={cn(
            "font-serif font-medium text-vc-accent whitespace-nowrap",
            compact ? "text-[0.95rem]" : "text-[1.55rem]",
          )}
        >
          Alleyfit
        </span>
        {!compact ? (
          <span className="hidden sm:block mt-1 text-[0.6rem] uppercase tracking-[0.32em] text-vc-accent/70">
            WELLNESS / STUDIO
          </span>
        ) : null}
      </span>
    </span>
  );
}

type NavItem = { to: string; key: DictKey };

const NAV_ITEMS: NavItem[] = [
  { to: "/hakkimizda", key: "nav.about" },
  { to: "/dersler", key: "nav.classes" },
  { to: "/", key: "nav.studio" },
  { to: "/program", key: "nav.program" },
  { to: "/kurumsal", key: "nav.corporate" },
  { to: "/yorumlar", key: "nav.reviews" },
  { to: "/iletisim", key: "nav.contact" },
];

const CTA_HREF = "/program";

export default function Nav() {
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 80], [0.9, 0.98]);
  const blurPx = useTransform(scrollY, [0, 80], [10, 16]);
  const backdropFilter = useTransform(blurPx, (v) => `blur(${v}px)`);
  const borderOpacity = useTransform(scrollY, [0, 80], [0.5, 1]);

  const [open, setOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const { t } = useLang();
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <motion.header style={{ backdropFilter }} className="fixed top-0 left-0 right-0 z-50 w-full">
      <motion.div
        style={{ opacity: bgOpacity }}
        className="absolute inset-0 bg-background pointer-events-none"
        aria-hidden
      />
      <motion.div
        style={{ opacity: borderOpacity }}
        className="absolute bottom-0 left-0 right-0 h-px bg-border pointer-events-none"
        aria-hidden
      />

      {/* Mobil: logo solda · hamburger sağda — ortası boş, dengeli.
          Masaüstü: logo solda · menü tam ortada · sosyal+dil sağda. */}
      <div className="relative mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 md:h-24 md:px-8">
        {/* Sol grup: logo + (yalnızca mobilde) WhatsApp / Instagram */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link
            to="/"
            className="flex min-w-0 shrink items-center hover:opacity-85 transition-opacity"
            aria-label="Alleyfit Wellness Studio - Anasayfa"
          >
            {!logoFailed ? (
              <img
                src="/logo.jpg"
                alt="Alleyfit Wellness Studio"
                className="h-11 w-auto object-contain sm:h-20"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <BrandMark />
            )}
          </Link>

          <div className="flex shrink-0 items-center gap-0.5 md:hidden">
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp ile iletişim"
              className="inline-flex h-9 w-9 items-center justify-center"
            >
              <WhatsAppGlyph className="h-[22px] w-[22px]" />
            </a>
            <a
              href={INSTAGRAM_HREF}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="inline-flex h-9 w-9 items-center justify-center"
            >
              <InstagramGlyph className="h-[22px] w-[22px]" />
            </a>
          </div>
        </div>

        <nav
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-x-6 md:flex lg:gap-x-9"
          aria-label="Ana menü"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "relative whitespace-nowrap font-sans text-[0.84rem] uppercase tracking-[0.14em] transition-colors duration-200 lg:text-[0.92rem] lg:tracking-[0.16em]",
                  isActive ? "font-semibold text-foreground" : "font-normal text-foreground/70 hover:text-foreground",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span>{t(item.key)}</span>
                  {isActive && <span aria-hidden className="absolute -bottom-1.5 left-0 right-0 h-px bg-foreground" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-4 md:flex">
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp ile iletişim"
            className="block transition-transform duration-200 hover:scale-110"
          >
            <WhatsAppGlyph className="h-7 w-7" />
          </a>
          <a
            href={INSTAGRAM_HREF}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="block transition-transform duration-200 hover:scale-110"
          >
            <InstagramGlyph className="h-7 w-7" />
          </a>
          <LangSwitcher />
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="-mr-2 shrink-0 md:hidden">
            <button
              type="button"
              aria-label="Menüyü aç"
              className="inline-flex h-11 w-11 items-center justify-center text-foreground"
            >
              <Menu strokeWidth={1.5} className="h-6 w-6" />
            </button>
          </SheetTrigger>

          <SheetContent side="right" className="flex flex-col bg-background">
            <nav className="mt-10 flex flex-col" aria-label="Mobil menü">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "border-b border-border/60 py-3.5 font-serif text-[1.35rem] tracking-[0.01em] transition-colors duration-200",
                      isActive ? "font-semibold text-foreground" : "font-normal text-foreground/70 hover:text-foreground",
                    )
                  }
                >
                  {t(item.key)}
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto space-y-5 pt-8">
              <div className="flex items-center justify-between">
                <span className="text-[0.62rem] uppercase tracking-[0.22em] text-foreground/40">Dil</span>
                <LangSwitcher />
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp ile iletişim"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background"
                >
                  <WhatsAppGlyph className="h-[18px] w-[18px]" />
                </a>
                <a
                  href={INSTAGRAM_HREF}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background"
                >
                  <InstagramGlyph className="h-[18px] w-[18px]" />
                </a>
              </div>

              <Link
                to={CTA_HREF}
                onClick={() => setOpen(false)}
                className="inline-flex w-full items-center justify-center rounded-none bg-primary px-6 py-4 font-sans text-[0.85rem] font-medium uppercase tracking-[0.18em] text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
              >
                {t("cta.reserve")}
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  );
}
