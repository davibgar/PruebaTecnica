"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Envoltura de entrada: desvanece y eleva su contenido al montar. Se usa para
 * revelar las secciones del dashboard de forma escalonada (efecto sutil, una
 * sola vez; no se reanima al cambiar filtros porque el nodo sigue montado).
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
