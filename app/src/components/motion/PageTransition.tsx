import { motion } from "framer-motion";
import type { ReactNode } from "react";

type PageTransitionProps = { children: ReactNode };

export default function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.main>
  );
}
