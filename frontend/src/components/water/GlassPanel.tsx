"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/src/lib/utils";

type GlowColor = "none" | "flow" | "clarity" | "murky" | "toxic";

const glowStyles: Record<GlowColor, string> = {
  none:    "",
  flow:    "shadow-[0_0_28px_rgba(56,189,248,0.18)]    border-flow/30",
  clarity: "shadow-[0_0_28px_rgba(6,182,212,0.18)]     border-clarity/30",
  murky:   "shadow-[0_0_28px_rgba(245,158,11,0.18)]    border-murky/30",
  toxic:   "shadow-[0_0_28px_rgba(239,68,68,0.18)]     border-toxic/30",
};

interface GlassPanelProps extends HTMLMotionProps<"div"> {
  glow?: GlowColor;
  elevated?: boolean;
}

export default function GlassPanel({
  children,
  className,
  glow = "none",
  elevated = false,
  ...props
}: GlassPanelProps) {
  return (
    <motion.div
      className={cn(
        elevated ? "glass-elevated" : "glass",
        "rounded-2xl",
        glowStyles[glow],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
