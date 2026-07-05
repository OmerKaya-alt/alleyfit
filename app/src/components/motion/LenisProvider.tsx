import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

type LenisProviderProps = { children: ReactNode };

export default function LenisProvider({ children }: LenisProviderProps) {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    window.__lenis = lenis;

    let raf = 0;
    function onRaf(time: number) {
      lenis.raf(time);
      raf = requestAnimationFrame(onRaf);
    }
    raf = requestAnimationFrame(onRaf);

    // ResizeObserver ile dinamik yükseklik güncellemelerini yakala (görsel yüklenmeleri vb.)
    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
    });
    resizeObserver.observe(document.body);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return <>{children}</>;
}
