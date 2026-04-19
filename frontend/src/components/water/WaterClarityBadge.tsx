"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Droplets, AlertTriangle, Biohazard } from "lucide-react";
import type { PollutionSeverity } from "@/src/lib/types";

const config = {
  Clean: {
    label: "Crystal Clear",
    icon:  Droplets,
    base:  "bg-clarity/15 text-clarity border-clarity/30",
    glow:  "0 0 14px rgba(6,182,212,0.35)",
  },
  Murky: {
    label: "Murky Waters",
    icon:  AlertTriangle,
    base:  "bg-murky/15 text-murky border-murky/30",
    glow:  "0 0 14px rgba(245,158,11,0.35)",
  },
  Toxic: {
    label: "Toxic",
    icon:  Biohazard,
    base:  "bg-toxic/15 text-toxic border-toxic/30",
    glow:  "0 0 14px rgba(239,68,68,0.35)",
  },
};

const sizes = {
  sm: { pill: "text-xs px-2.5 py-0.5 gap-1",    icon: "h-3 w-3" },
  md: { pill: "text-sm px-3.5 py-1   gap-1.5",   icon: "h-4 w-4" },
  lg: { pill: "text-base px-5 py-2   gap-2",      icon: "h-5 w-5" },
};

interface Props {
  severity: PollutionSeverity;
  size?: "sm" | "md" | "lg";
}

export default function WaterClarityBadge({ severity, size = "md" }: Props) {
  const { label, icon: Icon, base, glow } = config[severity];
  const { pill, icon: iconClass } = sizes[size];

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={severity}
        initial={{ opacity: 0, scale: 0.85, y: -4 }}
        animate={{ opacity: 1, scale: 1,    y:  0 }}
        exit={{    opacity: 0, scale: 0.85, y:  4 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        style={{ boxShadow: glow }}
        className={`inline-flex items-center rounded-full border font-semibold ${base} ${pill}`}
      >
        <Icon className={iconClass} />
        {label}
      </motion.span>
    </AnimatePresence>
  );
}
