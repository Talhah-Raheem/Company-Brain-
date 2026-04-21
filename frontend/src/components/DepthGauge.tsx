"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const stops: {
  href: string;
  label: string;
  depth: string;
  numeral: string;
  color: string;
  halo: string;
  panel: string;
  text: string;
}[] = [
  {
    href: "/",
    label: "Surface",
    depth: "0m",
    numeral: "",
    color: "#ffd08f",
    halo: "rgba(255, 188, 120, 0.42)",
    panel: "linear-gradient(135deg, rgba(255, 180, 118, 0.24), rgba(71, 152, 196, 0.18))",
    text: "text-[#ffe7b9]",
  },
  {
    href: "/ingest",
    label: "Ingestion",
    depth: "20m",
    numeral: "I",
    color: "#8cf0df",
    halo: "rgba(140, 240, 223, 0.34)",
    panel: "linear-gradient(135deg, rgba(80, 207, 204, 0.24), rgba(28, 114, 160, 0.18))",
    text: "text-[#bffcf5]",
  },
  {
    href: "/audit",
    label: "Audit",
    depth: "120m",
    numeral: "II",
    color: "#7dd3fc",
    halo: "rgba(125, 211, 252, 0.34)",
    panel: "linear-gradient(135deg, rgba(52, 153, 217, 0.22), rgba(10, 41, 76, 0.22))",
    text: "text-[#cfefff]",
  },
  {
    href: "/search",
    label: "Clarity",
    depth: "500m",
    numeral: "III",
    color: "#66c8ff",
    halo: "rgba(102, 200, 255, 0.28)",
    panel: "linear-gradient(135deg, rgba(43, 111, 174, 0.24), rgba(7, 19, 40, 0.24))",
    text: "text-[#c8ebff]",
  },
  {
    href: "/governance",
    label: "Governance",
    depth: "2000m",
    numeral: "IV",
    color: "#4ca0da",
    halo: "rgba(76, 160, 218, 0.22)",
    panel: "linear-gradient(135deg, rgba(19, 49, 94, 0.3), rgba(1, 5, 14, 0.3))",
    text: "text-[#a9d7ff]",
  },
];

export default function DepthGauge() {
  const pathname = usePathname();
  const activeIdx = stops.findIndex((stop) => stop.href === pathname);
  const dotCenterOffset = 31;
  const dotStep = 38;

  return (
    <div
      aria-hidden={false}
      className="hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 z-20 flex-col"
    >
      <div className="relative flex flex-col items-center py-3 px-2 rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] backdrop-blur-md border border-white/10 shadow-[0_14px_50px_rgba(0,0,0,0.28)]">
        <div className="absolute top-5 bottom-5 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-white/25 via-white/20 to-white/5" />

        {activeIdx >= 0 && (
          <motion.div
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 w-[3px] rounded-full"
            initial={false}
            animate={{
              top: `${dotCenterOffset}px`,
              height: `${Math.max(activeIdx, 0) * dotStep}px`,
              background: `linear-gradient(to bottom, ${stops[0].color}, ${stops[activeIdx].color})`,
              boxShadow: `0 0 18px ${stops[activeIdx].halo}`,
            }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
          />
        )}

        {stops.map((stop, index) => {
          const isActive = index === activeIdx;
          const isPassed = activeIdx >= 0 && index < activeIdx;

          return (
            <Link
              key={stop.href}
              href={stop.href}
              className="group relative py-3 px-3 flex items-center justify-center"
              aria-label={`${stop.label} · ${stop.depth}`}
            >
              <div
                className="relative h-3.5 w-3.5 rounded-full border transition-all duration-300"
                style={{
                  background: isActive || isPassed ? stop.color : "rgba(255,255,255,0.14)",
                  borderColor: isActive || isPassed ? "rgba(255,255,255,0.42)" : "rgba(255,255,255,0.18)",
                  boxShadow: isActive
                    ? `0 0 0 4px rgba(255,255,255,0.06), 0 0 18px ${stop.halo}`
                    : isPassed
                      ? `0 0 10px ${stop.halo}`
                      : "none",
                  transform: isActive ? "scale(1.12)" : "scale(1)",
                }}
              >
                {isActive && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-full"
                    style={{ background: stop.color }}
                    animate={{ scale: [1, 2.6, 1], opacity: [0.45, 0, 0.45] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
              </div>

              <div
                className={`absolute right-full top-1/2 -translate-y-1/2 mr-2 pr-1 pointer-events-none whitespace-nowrap transition-all duration-200 ${
                  isActive ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                }`}
              >
                <div
                  className="rounded-full pl-3 pr-3.5 py-1.5 flex items-center gap-2 border border-white/10 shadow-lg backdrop-blur-xl"
                  style={{ background: stop.panel }}
                >
                  {stop.numeral && (
                    <span className={`eyebrow ${stop.text} opacity-85`}>
                      {stop.numeral}
                    </span>
                  )}
                  <span className={`text-xs font-medium ${stop.text}`}>
                    {stop.label}
                  </span>
                  <span className="text-white/40 text-[10px] tabular-nums">
                    {stop.depth}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-2 text-center">
        <span className="eyebrow text-white/30 text-[0.55rem]">Depth</span>
      </div>
    </div>
  );
}
