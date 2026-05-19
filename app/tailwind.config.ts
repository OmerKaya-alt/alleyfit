import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // shadcn tokens → driven from CSS variables (defined in index.css)
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: "var(--destructive)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",

        // Vibecycle aliases (project-specific)
        "vc-bg": "var(--vc-bg)",
        "vc-bg-2": "var(--vc-bg-2)",
        "vc-ink": "var(--vc-ink)",
        "vc-ink-soft": "var(--vc-ink-soft)",
        "vc-ink-mute": "var(--vc-ink-mute)",
        "vc-line": "var(--vc-line)",
        "vc-line-strong": "var(--vc-line-strong)",
        "vc-accent": "var(--vc-accent)",
        "vc-accent-alt": "var(--vc-accent-alt)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        // Vibecycle uses ONE font (DM Sans) for both display + body, weight differs
        sans: ['"DM Sans"', "system-ui", "-apple-system", "sans-serif"],
        serif: ['"DM Sans"', "system-ui", "-apple-system", "sans-serif"],
        body: ['"DM Sans"', "system-ui", "-apple-system", "sans-serif"],
        display: ['"DM Sans"', "system-ui", "-apple-system", "sans-serif"],
      },
      maxWidth: {
        site: "1440px",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
