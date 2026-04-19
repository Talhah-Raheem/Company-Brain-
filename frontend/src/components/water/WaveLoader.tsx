"use client";

import { motion } from "framer-motion";

type Variant = "flow" | "clarity" | "murky" | "toxic";

const sweepColor: Record<Variant, string> = {
  flow:    "via-flow/25",
  clarity: "via-clarity/25",
  murky:   "via-murky/30",
  toxic:   "via-toxic/25",
};

/**
 * Shimmer-bar loading primitive — a horizontal cyan sweep across a translucent rail.
 * Compose multiple bars to build skeletons for cards, clusters, results, etc.
 */
export default function WaveLoader({
  width = "w-full",
  height = "h-3",
  variant = "flow",
  delay = 0,
  className = "",
}: {
  width?: string;
  height?: string;
  variant?: Variant;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-full bg-surface/35 overflow-hidden ${height} ${width} ${className}`}
      aria-hidden
    >
      <motion.div
        className={`absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent ${sweepColor[variant]} to-transparent`}
        animate={{ x: ["-100%", "300%"] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay }}
      />
    </div>
  );
}
