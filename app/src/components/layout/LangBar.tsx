import { useState, type SVGProps } from "react";

import { cn } from "@/lib/utils";

type Lang = "tr" | "en";

// Türk bayrağı — kırmızı zemin + beyaz hilal + beş köşeli yıldız
function FlagTR(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 30 20"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <rect width="30" height="20" fill="#E30A17" />
      <circle cx="11.5" cy="10" r="4.2" fill="#fff" />
      <circle cx="12.6" cy="10" r="3.3" fill="#E30A17" />
      <polygon
        points="17.4,10 15.4,10.65 16.65,8.95 16.65,11.05 15.4,9.35"
        fill="#fff"
      />
    </svg>
  );
}

// Birleşik Krallık bayrağı — sade Union Jack (EN için)
function FlagEN(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 30 20"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <rect width="30" height="20" fill="#012169" />
      <path d="M0 0 L30 20 M30 0 L0 20" stroke="#fff" strokeWidth="3" />
      <path d="M0 0 L30 20 M30 0 L0 20" stroke="#C8102E" strokeWidth="1.5" />
      <path d="M15 0 V20 M0 10 H30" stroke="#fff" strokeWidth="5" />
      <path d="M15 0 V20 M0 10 H30" stroke="#C8102E" strokeWidth="3" />
    </svg>
  );
}

export default function LangBar() {
  const [lang, setLang] = useState<Lang>("tr");

  const baseItem =
    "inline-flex items-center gap-1.5 font-sans text-[0.65rem] uppercase tracking-[0.18em] transition-colors duration-200";

  return (
    <div
      className="fixed top-3 right-3 z-[60] hidden md:flex items-center gap-2.5 rounded-full border border-border bg-background/80 px-3 py-1.5 backdrop-blur"
      role="group"
      aria-label="Dil seçimi"
    >
      <button
        type="button"
        onClick={() => setLang("tr")}
        aria-pressed={lang === "tr"}
        className={cn(
          baseItem,
          lang === "tr"
            ? "font-medium text-foreground"
            : "text-foreground/40 hover:text-foreground/60"
        )}
      >
        <FlagTR className="w-4 h-[10px] rounded-[1px]" />
        TR
      </button>

      <span aria-hidden className="h-3 w-px bg-border" />

      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={cn(
          baseItem,
          lang === "en"
            ? "font-medium text-foreground"
            : "text-foreground/40 hover:text-foreground/60"
        )}
      >
        <FlagEN className="w-4 h-[10px] rounded-[1px]" />
        EN
      </button>
    </div>
  );
}
