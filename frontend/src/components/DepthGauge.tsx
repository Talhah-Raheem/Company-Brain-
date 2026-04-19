"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const stops: {
  href: string;
  label: string;
  depth: string;
  numeral: string;
}[] = [
  { href: "/",           label: "Surface",    depth: "0m",    numeral: "" },
  { href: "/ingest",     label: "Ingestion",  depth: "20m",   numeral: "I" },
  { href: "/audit",      label: "Audit",      depth: "120m",  numeral: "II" },
  { href: "/search",     label: "Clarity",    depth: "500m",  numeral: "III" },
  { href: "/governance", label: "Governance", depth: "2000m", numeral: "IV" },
];

export default function DepthGauge() {
  const pathname = usePathname();
  const activeIdx = stops.findIndex(s => s.href === pathname);

  return (
    <div
      aria-hidden={false}
      className="hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 z-20 flex-col"
    >
      <div className="relative flex flex-col items-center py-2">
        {/* vertical rail */}
        <div className="absolute top-4 bottom-4 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-foam/8 via-foam/18 to-foam/5" />

        {stops.map((stop, i) => {
          const isActive  = i === activeIdx;
          const isPassed  = activeIdx >= 0 && i < activeIdx;

          return (
            <Link
              key={stop.href}
              href={stop.href}
              className="group relative py-3 px-3 flex items-center justify-center"
              aria-label={`${stop.label} · ${stop.depth}`}
            >
              {/* dot */}
              <div
                className={`relative h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-bioluminescent scale-125"
                    : isPassed
                    ? "bg-foam/40 group-hover:bg-foam/70"
                    : "bg-foam/15 group-hover:bg-foam/45"
                }`}
                style={
                  isActive
                    ? {
                        boxShadow:
                          "0 0 14px rgba(125, 211, 252, 0.8), 0 0 28px rgba(125, 211, 252, 0.35)",
                      }
                    : undefined
                }
              >
                {isActive && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-bioluminescent"
                    animate={{ scale: [1, 2.4, 1], opacity: [0.55, 0, 0.55] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
              </div>

              {/* hover/active label — flips out to the left of the dot */}
              <div
                className={`absolute right-full top-1/2 -translate-y-1/2 mr-1 pr-2 pointer-events-none whitespace-nowrap transition-opacity duration-200 ${
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
              >
                <div className="glass rounded-full pl-3 pr-3.5 py-1.5 flex items-center gap-2 shadow-lg">
                  {stop.numeral && (
                    <span className="eyebrow text-bioluminescent/80">
                      {stop.numeral}
                    </span>
                  )}
                  <span className="text-foam/80 text-xs font-medium">
                    {stop.label}
                  </span>
                  <span className="text-foam/30 text-[10px] tabular-nums">
                    {stop.depth}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* tiny "Depth" caption under the gauge */}
      <div className="mt-1 text-center">
        <span className="eyebrow text-foam/25 text-[0.55rem]">Depth</span>
      </div>
    </div>
  );
}
