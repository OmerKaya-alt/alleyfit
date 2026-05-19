// Vibecycle-pattern Hero — full-bleed image bg + dark overlay + centered eyebrow/title/subtitle/CTA(s).
// Tek pattern, varyant yok. Sequenced reveal (Framer Motion stagger) + hafif Ken Burns zoom.
//
// Kullanım:
// <Hero
//   eyebrow="ALLEYFIT PILATES · ŞİŞLİ"
//   title="Pilatesin En İyi Hali"
//   subtitle="Reformer, mat ve özel eğitmen seansları ile bedeninizi yeniden keşfedin."
//   image="https://..."
//   ctaPrimary={{ label: "REZERVASYON", href: "/program" }}
//   ctaSecondary={{ label: "DERSLERİMİZ", href: "/dersler" }}
//   height="tall"
// />

import { motion, type Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type HeroProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  image: string;
  alt?: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  height?: "full" | "tall" | "medium";
  className?: string;
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] },
  },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const heightClassMap: Record<NonNullable<HeroProps["height"]>, string> = {
  full: "h-[100vh]",
  tall: "h-[88vh] min-h-[640px]",
  medium: "h-[72vh] min-h-[520px]",
};

export default function Hero({
  eyebrow,
  title,
  subtitle,
  image,
  alt,
  ctaPrimary,
  ctaSecondary,
  height = "tall",
  className,
}: HeroProps) {
  return (
    <section
      className={cn(
        "relative w-full overflow-hidden",
        heightClassMap[height],
        className,
      )}
    >
      {/* Background image (blurred + dimmed) + soft dark wash */}
      <div className="absolute inset-0">
        <motion.img
          src={image}
          alt={alt ?? ""}
          className="w-full h-full object-cover"
          style={{ filter: "blur(4px) brightness(0.55) contrast(1.05)" }}
          initial={{ scale: 1.15 }}
          animate={{ scale: [1.15, 1.2] }}
          transition={{
            duration: 12,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-foreground/40" aria-hidden="true" />
      </div>

      {/* Content */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 h-full flex flex-col items-center justify-center text-center px-[var(--pad-x,1.5rem)]"
      >
        <motion.span
          variants={fadeUp}
          className="block mb-6 text-[0.72rem] uppercase tracking-[0.28em] text-white font-semibold [text-shadow:0_1px_14px_rgba(0,0,0,0.6)]"
        >
          {eyebrow}
        </motion.span>

        <motion.h1
          variants={fadeUp}
          className="font-serif text-[clamp(2.8rem,7vw,7rem)] leading-[1.04] tracking-[-0.02em] text-white max-w-[18ch] mx-auto [text-shadow:0_2px_4px_rgba(0,0,0,0.35),0_14px_40px_rgba(0,0,0,0.55)] font-medium"
        >
          {title}
        </motion.h1>

        {subtitle ? (
          <motion.p
            variants={fadeUp}
            className="text-white text-[1.05rem] leading-relaxed max-w-[40ch] mx-auto mt-6 [text-shadow:0_1px_18px_rgba(0,0,0,0.7)]"
          >
            {subtitle}
          </motion.p>
        ) : null}

        <motion.div
          variants={fadeUp}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            to={ctaPrimary.href}
            className="group inline-flex items-center gap-2 rounded-none bg-vc-accent text-white px-7 py-4 text-[0.78rem] uppercase tracking-[0.18em] font-semibold hover:bg-vc-accent-alt hover:-translate-y-0.5 transition duration-300"
          >
            {ctaPrimary.label}
            <ArrowRight strokeWidth={1.5} className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          {ctaSecondary ? (
            <Link
              to={ctaSecondary.href}
              className="inline-flex items-center gap-2 rounded-none border border-white text-white px-7 py-4 text-[0.78rem] uppercase tracking-[0.18em] font-semibold hover:bg-white hover:text-black hover:-translate-y-0.5 transition duration-300"
            >
              {ctaSecondary.label}
            </Link>
          ) : null}
        </motion.div>
      </motion.div>
    </section>
  );
}
