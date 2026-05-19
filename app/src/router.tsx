import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const Studio = lazy(() => import("./pages/Studio"));
const Classes = lazy(() => import("./pages/Classes"));
const About = lazy(() => import("./pages/About"));
const Schedule = lazy(() => import("./pages/Schedule"));
const Contact = lazy(() => import("./pages/Contact"));
const Corporate = lazy(() => import("./pages/Corporate"));

export const routes: RouteObject[] = [
  { path: "/", element: <Studio /> },
  { path: "/dersler", element: <Classes /> },
  { path: "/hakkimizda", element: <About /> },
  { path: "/program", element: <Schedule /> },
  { path: "/iletisim", element: <Contact /> },
  { path: "/kurumsal", element: <Corporate /> },
];
