"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Upload, ScanSearch, LayoutDashboard, ArrowRight, ShieldCheck } from "lucide-react";
import GlassPanel from "@/src/components/water/GlassPanel";
import RippleButton from "@/src/components/water/RippleButton";

const features = [
  {
    icon:  Upload,
    title: "Purified Ingestion",
    desc:  "Every document is scanned for PII, secrets, and toxic data before it touches the corpus. Nothing dirty gets in.",
    href:  "/ingest",
    color: "text-clarity",
    iconBg:"bg-clarity/15 border-clarity/25",
    glow:  "clarity" as const,
  },
  {
    icon:  ScanSearch,
    title: "Diver Mode",
    desc:  "Query your corpus and watch the diver surface contradictions between documents — side-by-side, no hiding.",
    href:  "/audit",
    color: "text-flow",
    iconBg:"bg-flow/15 border-flow/25",
    glow:  "flow" as const,
  },
  {
    icon:  LayoutDashboard,
    title: "Clarity Dashboard",
    desc:  "Every search result carries a Water Clarity Score. Know exactly how trustworthy each source is before you use it.",
    href:  "/search",
    color: "text-murky",
    iconBg:"bg-murky/15 border-murky/25",
    glow:  "none" as const,
  },
];

export default function HomePage() {
  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden -mt-4">

      {/* ── Atmospheric background orbs ── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{ y: [0, -28, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-[10%] w-[520px] h-[520px] rounded-full bg-flow/[0.07] blur-[110px]"
        />
        <motion.div
          animate={{ y: [0, 22, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[30%] right-[8%] w-[420px] h-[420px] rounded-full bg-clarity/[0.07] blur-[100px]"
        />
        <motion.div
          animate={{ y: [0, -16, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          className="absolute bottom-[10%] left-[30%] w-[360px] h-[360px] rounded-full bg-surface/25 blur-[90px]"
        />
      </div>

      {/* ── Hero ── */}
      <div className="text-center space-y-7 mb-24 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y:  0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase text-flow/70 border border-flow/20 rounded-full px-4 py-1.5 glass"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Human Delta · Safety &amp; Orchestration Track
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y:  0 }}
          transition={{ duration: 0.75, delay: 0.1 }}
          className="text-[clamp(3rem,8vw,5.5rem)] font-extrabold tracking-tight leading-none"
        >
          <span className="text-gradient-flow">The Safety Diver</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y:  0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-xl text-foam/50 max-w-lg mx-auto leading-relaxed"
        >
          Knowledge Clarity = Water Clarity.
          <br />
          The Knowledge Purification Plant for AI Agents.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y:  0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link href="/ingest">
            <RippleButton variant="primary" className="text-base px-7 py-3">
              Start Purifying
              <ArrowRight className="h-4 w-4" />
            </RippleButton>
          </Link>
        </motion.div>
      </div>

      {/* ── Feature cards ── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y:  0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full"
      >
        {features.map(({ icon: Icon, title, desc, href, color, iconBg, glow }) => (
          <Link key={href} href={href} className="group block">
            <GlassPanel
              glow={glow}
              whileHover={{ y: -7, transition: { duration: 0.22, ease: "easeOut" } }}
              className="p-8 h-full cursor-pointer"
            >
              <div className="flex flex-col gap-5 h-full">
                {/* Icon badge */}
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${iconBg} ${color} shrink-0`}>
                  <Icon className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-foam mb-2">{title}</h3>
                  <p className="text-foam/45 text-sm leading-relaxed">{desc}</p>
                </div>

                {/* Hover CTA */}
                <div className={`flex items-center gap-1 text-xs font-semibold ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                  Explore <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </GlassPanel>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
