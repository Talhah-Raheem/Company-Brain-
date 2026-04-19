"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanSearch, ArrowRight, BookOpen, Swords, ShieldCheck, Loader2 } from "lucide-react";
import GlassPanel from "@/src/components/water/GlassPanel";
import RippleButton from "@/src/components/water/RippleButton";
import FlowLayout from "@/src/components/water/FlowLayout";
import { audit, resolve } from "@/src/lib/api";
import type { AuditReport, Contradiction } from "@/src/lib/types";

type ResolveStatus = "idle" | "resolving" | "resolved";

function ShimmerBar({ width = "w-full", delay = 0 }: { width?: string; delay?: number }) {
  return (
    <div className={`relative h-3 rounded-full bg-surface/40 overflow-hidden ${width}`}>
      <motion.div
        className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: ["-100%", "300%"] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay }}
      />
    </div>
  );
}

function DivingSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div className="rounded-2xl border border-toxic/15 bg-current/40 p-6 space-y-4">
      <ShimmerBar width="w-1/3" delay={delay} />
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-surface/20 p-4 space-y-2">
          <ShimmerBar width="w-2/3" delay={delay + 0.1} />
          <ShimmerBar delay={delay + 0.15} />
          <ShimmerBar width="w-5/6" delay={delay + 0.2} />
        </div>
        <div className="rounded-xl bg-surface/20 p-4 space-y-2">
          <ShimmerBar width="w-2/3" delay={delay + 0.15} />
          <ShimmerBar delay={delay + 0.2} />
          <ShimmerBar width="w-5/6" delay={delay + 0.25} />
        </div>
      </div>
      <div className="flex gap-3">
        <ShimmerBar width="w-32" delay={delay + 0.3} />
        <ShimmerBar width="w-32" delay={delay + 0.35} />
      </div>
    </div>
  );
}

function ContradictionCard({ c }: { c: Contradiction }) {
  const [resolveStatus, setResolveStatus] = useState<ResolveStatus>("idle");
  const [resolvedMsg, setResolvedMsg]     = useState("");
  const [canonicalSrc, setCanonicalSrc]   = useState("");

  const trust = async (canonical: string, rejected: string) => {
    setResolveStatus("resolving");
    try {
      const res = await resolve({ term: c.term, canonical_source: canonical, rejected_source: rejected });
      setResolvedMsg(res.message);
      setCanonicalSrc(canonical);
      setResolveStatus("resolved");
    } catch {
      setResolveStatus("idle");
    }
  };

  return (
    <GlassPanel glow={resolveStatus === "resolved" ? "clarity" : "toxic"} className="p-6 space-y-4">
      <p className="text-xs font-bold uppercase tracking-widest text-toxic/80">
        Conflict on &quot;{c.term}&quot;
      </p>

      {/* Side-by-side diff */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`glass-elevated rounded-xl p-4 space-y-2 transition-all duration-300 ${resolveStatus === "resolved" && canonicalSrc === c.source_a ? "ring-1 ring-clarity/50" : ""}`}>
          <p className="text-[11px] font-semibold text-foam/35 truncate">{c.source_a}</p>
          <p className="text-sm text-foam/80 leading-relaxed">&quot;{c.snippet_a}&quot;</p>
        </div>
        <div className={`glass-elevated rounded-xl p-4 space-y-2 transition-all duration-300 ${resolveStatus === "resolved" && canonicalSrc === c.source_b ? "ring-1 ring-clarity/50" : ""}`}>
          <p className="text-[11px] font-semibold text-foam/35 truncate">{c.source_b}</p>
          <p className="text-sm text-foam/80 leading-relaxed">&quot;{c.snippet_b}&quot;</p>
        </div>
      </div>

      {/* Trust buttons / resolved state */}
      <AnimatePresence mode="wait">
        {resolveStatus === "resolved" ? (
          <motion.div
            key="resolved"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-clarity/10 border border-clarity/25"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-clarity shrink-0" />
              <p className="text-sm font-semibold text-clarity">{resolvedMsg}</p>
            </div>
            <button
              onClick={() => { setResolveStatus("idle"); setResolvedMsg(""); setCanonicalSrc(""); }}
              className="text-xs text-foam/30 hover:text-foam/60 transition-colors shrink-0"
            >
              Change
            </button>
          </motion.div>
        ) : (
          <motion.div key="buttons" className="flex items-center gap-3">
            <p className="text-xs text-foam/30 mr-1">Mark as canonical:</p>
            <RippleButton
              onClick={() => trust(c.source_a, c.source_b)}
              disabled={resolveStatus === "resolving"}
              variant="secondary"
              className="text-xs"
            >
              {resolveStatus === "resolving" ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <ShieldCheck className="h-3 w-3" />
              )}
              Trust {c.source_a}
            </RippleButton>
            <RippleButton
              onClick={() => trust(c.source_b, c.source_a)}
              disabled={resolveStatus === "resolving"}
              variant="secondary"
              className="text-xs"
            >
              {resolveStatus === "resolving" ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <ShieldCheck className="h-3 w-3" />
              )}
              Trust {c.source_b}
            </RippleButton>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassPanel>
  );
}

type PageStatus = "idle" | "diving" | "done" | "error";

export default function AuditPage() {
  const [query,  setQuery]  = useState("");
  const [status, setStatus] = useState<PageStatus>("idle");
  const [report, setReport] = useState<AuditReport | null>(null);
  const [error,  setError]  = useState("");

  const dive = async () => {
    if (!query.trim()) return;
    setStatus("diving");
    setReport(null);
    setError("");
    try {
      const res = await audit(query.trim());
      setReport(res);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setStatus("error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10">

      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foam">Diver Mode</h1>
        <p className="mt-2 text-foam/50 text-sm">
          Enter a term or topic. The diver will search your corpus and surface every contradiction.
        </p>
      </div>

      {/* ── Search bar ── */}
      <GlassPanel glow="flow" className="p-2 flex items-center gap-3">
        <ScanSearch className="ml-3 h-5 w-5 text-foam/30 shrink-0" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && dive()}
          placeholder='Try "refund policy" or "data retention"'
          className="flex-1 bg-transparent text-foam placeholder-foam/25 text-sm outline-none py-3"
        />
        <RippleButton
          onClick={dive}
          disabled={status === "diving" || !query.trim()}
          variant="primary"
          className="shrink-0"
        >
          Dive <ArrowRight className="h-4 w-4" />
        </RippleButton>
      </GlassPanel>

      {/* ── Diving state ── */}
      <AnimatePresence>
        {status === "diving" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <p className="text-xs font-semibold tracking-widest uppercase text-foam/30">Diving deep…</p>
            <DivingSkeleton delay={0} />
            <DivingSkeleton delay={0.1} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error ── */}
      <AnimatePresence>
        {status === "error" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GlassPanel glow="toxic" className="p-5">
              <p className="text-toxic text-sm font-medium">{error}</p>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results ── */}
      <AnimatePresence>
        {report && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="space-y-10"
          >
            {/* Contradictions */}
            {report.contradictions.length > 0 ? (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Swords className="h-4 w-4 text-toxic" />
                  <h2 className="text-sm font-bold tracking-widest uppercase text-foam/50">
                    {report.contradictions.length} Contradiction{report.contradictions.length > 1 ? "s" : ""} Found
                  </h2>
                </div>
                <FlowLayout className="space-y-4">
                  {report.contradictions.map((c, i) => (
                    <ContradictionCard key={i} c={c} />
                  ))}
                </FlowLayout>
              </section>
            ) : (
              <GlassPanel glow="clarity" className="p-7 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-clarity/15 border border-clarity/25 flex items-center justify-center text-clarity shrink-0">
                  <ScanSearch className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foam">Waters are clear</p>
                  <p className="text-foam/45 text-sm mt-0.5">No contradictions found for &quot;{report.query}&quot;.</p>
                </div>
              </GlassPanel>
            )}

            {/* Document clusters */}
            {report.clusters.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-foam/40" />
                  <h2 className="text-sm font-bold tracking-widest uppercase text-foam/40">
                    {report.clusters.length} Source{report.clusters.length > 1 ? "s" : ""} Referenced
                  </h2>
                </div>
                <FlowLayout className="space-y-3">
                  {report.clusters.map((cluster, i) => (
                    <GlassPanel key={i} className="p-5 space-y-3">
                      <p className="text-xs font-semibold text-flow/80 truncate">{cluster.source}</p>
                      <div className="space-y-2">
                        {cluster.snippets.map((s, j) => (
                          <p key={j} className="text-sm text-foam/55 leading-relaxed border-l-2 border-surface pl-3">
                            &quot;{s}&quot;
                          </p>
                        ))}
                      </div>
                    </GlassPanel>
                  ))}
                </FlowLayout>
              </section>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
