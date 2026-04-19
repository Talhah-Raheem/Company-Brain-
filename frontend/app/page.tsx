"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Upload,
  ScanSearch,
  LayoutDashboard,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import RippleButton from "@/src/components/water/RippleButton";

type Accent = "bioluminescent" | "flow" | "murky";

const features: {
  icon: typeof Upload;
  label: string;
  title: string;
  desc: string;
  href: string;
  accent: Accent;
}[] = [
  {
    icon: Upload,
    label: "I · Ingestion",
    title: "Purified Ingestion",
    desc: "Every document is scanned for PII, secrets, and toxic data before it touches the corpus. Nothing dirty gets in.",
    href: "/ingest",
    accent: "bioluminescent",
  },
  {
    icon: ScanSearch,
    label: "II · Audit",
    title: "Diver Mode",
    desc: "Query your corpus and watch the diver surface contradictions between documents — side-by-side, no hiding.",
    href: "/audit",
    accent: "flow",
  },
  {
    icon: LayoutDashboard,
    label: "III · Clarity",
    title: "Clarity Dashboard",
    desc: "Every search result carries a Water Clarity Score. Know exactly how trustworthy each source is before you use it.",
    href: "/search",
    accent: "murky",
  },
];

const accentMap: Record<Accent, { text: string; bar: string; glow: string }> = {
  bioluminescent: {
    text: "text-bioluminescent",
    bar: "bg-bioluminescent",
    glow: "group-hover:shadow-[0_0_40px_rgba(125,211,252,0.25)]",
  },
  flow: {
    text: "text-flow",
    bar: "bg-flow",
    glow: "group-hover:shadow-[0_0_40px_rgba(56,189,248,0.22)]",
  },
  murky: {
    text: "text-murky",
    bar: "bg-murky",
    glow: "group-hover:shadow-[0_0_40px_rgba(245,158,11,0.18)]",
  },
};

export default function HomePage() {
  return (
    <div className="relative flex flex-col items-center overflow-hidden -mt-4 pt-16 pb-28">

      {/* Central bioluminescent pulse behind the title — evokes a deep-sea organism */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-[12%] left-1/2 -translate-x-1/2 w-[780px] h-[780px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(125, 211, 252, 0.17) 0%, rgba(125, 211, 252, 0) 60%)",
        }}
        animate={{ opacity: [0.45, 0.85, 0.45], scale: [1, 1.07, 1] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Hero ── */}
      <div className="relative text-center space-y-8 mb-32">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 eyebrow text-bioluminescent/80 border border-bioluminescent/20 rounded-full px-4 py-1.5 glass"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Human Delta · Safety &amp; Orchestration</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.15 }}
          className="font-display font-normal text-[clamp(3.25rem,9vw,6.25rem)] leading-[0.95] tracking-tight"
        >
          <span className="block text-foam">The Safety</span>
          <span className="block italic text-gradient-flow">Diver</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-xl mx-auto"
        >
          <span className="font-display italic text-xl md:text-2xl text-foam/55 leading-relaxed block">
            Knowledge clarity equals water clarity.
          </span>
          <span className="eyebrow text-foam/40 mt-4 block">
            A purification plant for AI knowledge
          </span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="pt-4"
        >
          <Link href="/ingest">
            <RippleButton variant="primary" className="text-base px-8 py-3.5">
              Begin the dive
              <ArrowRight className="h-4 w-4" />
            </RippleButton>
          </Link>
        </motion.div>
      </div>

      {/* ── Section divider ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="eyebrow text-foam/35 mb-10 flex items-center gap-3"
      >
        <span className="h-px w-8 bg-foam/20" />
        <span>Three depths to explore</span>
        <span className="h-px w-8 bg-foam/20" />
      </motion.div>

      {/* ── Feature cards ── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.65 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full"
      >
        {features.map(({ icon: Icon, label, title, desc, href, accent }) => {
          const a = accentMap[accent];
          return (
            <Link key={href} href={href} className="group block">
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={`glass-deep rounded-2xl p-8 h-full cursor-pointer relative overflow-hidden transition-shadow duration-300 ${a.glow}`}
              >
                {/* Left accent bar — extends on hover like a museum label */}
                <div
                  className={`absolute left-0 top-8 bottom-8 w-[3px] ${a.bar} opacity-60 group-hover:opacity-100 group-hover:top-6 group-hover:bottom-6 transition-all duration-300`}
                />

                <div className="flex flex-col gap-6 h-full pl-2">
                  <div className="flex items-center justify-between">
                    <span className={`eyebrow ${a.text} opacity-70`}>
                      {label}
                    </span>
                    <Icon className={`h-4 w-4 ${a.text} opacity-60`} />
                  </div>

                  <div className="flex-1 space-y-3">
                    <h3 className="font-display text-2xl text-foam leading-tight">
                      {title}
                    </h3>
                    <p className="text-foam/50 text-sm leading-relaxed">
                      {desc}
                    </p>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 text-xs font-semibold ${a.text} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                  >
                    Descend <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}
