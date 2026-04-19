"use client";

import { motion } from "framer-motion";

interface Props {
  size?: number;
  label?: string;
}

export default function VortexSpinner({ size = 88, label = "Diving deep..." }: Props) {
  return (
    <div className="flex flex-col items-center gap-5">
      <svg width={size} height={size} viewBox="0 0 100 100" overflow="visible">
        {/* Outer arc — slow clockwise */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "50px 50px" }}
        >
          <circle
            cx="50" cy="50" r="43"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="68 203"
          />
        </motion.g>

        {/* Middle arc — counter-clockwise, medium */}
        <motion.g
          animate={{ rotate: -360 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "50px 50px" }}
        >
          <circle
            cx="50" cy="50" r="29"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="46 137"
          />
        </motion.g>

        {/* Inner arc — fast clockwise */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "50px 50px" }}
        >
          <circle
            cx="50" cy="50" r="15"
            fill="none"
            stroke="#e0f2fe"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="24 70"
          />
        </motion.g>

        {/* Pulsing center node */}
        <motion.circle
          cx="50" cy="50" r="3.5"
          fill="#06b6d4"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {label && (
        <motion.p
          animate={{ opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="text-xs font-medium tracking-[0.2em] uppercase text-foam/50"
        >
          {label}
        </motion.p>
      )}
    </div>
  );
}
