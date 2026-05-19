import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Nav from "./components/layout/Nav";
import Footer from "./components/layout/Footer";
import PageTransition from "./components/motion/PageTransition";

const Studio = lazy(() => import("./pages/Studio"));
const Classes = lazy(() => import("./pages/Classes"));
const About = lazy(() => import("./pages/About"));
const Schedule = lazy(() => import("./pages/Schedule"));
const Contact = lazy(() => import("./pages/Contact"));
const Corporate = lazy(() => import("./pages/Corporate"));
const Reviews = lazy(() => import("./pages/Reviews"));
const Admin = lazy(() => import("./pages/Admin"));

export default function App() {
  const location = useLocation();

  // Sekme değiştiğinde her zaman sayfanın en üstüne dön
  // (Lenis smooth scroll açıkken window.scrollTo'yu yakalıyor — direct lenis instance kullan)
  useEffect(() => {
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true, force: true });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [location.pathname]);

  return (
    <>
      <Nav />
      <Suspense fallback={null}>
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Routes location={location}>
              <Route path="/" element={<Studio />} />
              <Route path="/dersler" element={<Classes />} />
              <Route path="/hakkimizda" element={<About />} />
              <Route path="/program" element={<Schedule />} />
              <Route path="/iletisim" element={<Contact />} />
              <Route path="/kurumsal" element={<Corporate />} />
              <Route path="/yorumlar" element={<Reviews />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/yorumlar" element={<Reviews />} />
            </Routes>
          </PageTransition>
        </AnimatePresence>
      </Suspense>
      <Footer />
    </>
  );
}
