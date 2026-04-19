"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanSearch, ArrowRight, BookOpen, Swords } from "lucide-react";
import GlassPanel from "@/src/components/water/GlassPanel";
import VortexSpinner from "@/src/components/water/VortexSpinner";
import RippleButton from "@/src/components/water/RippleButton";
import FlowLayout from "@/src/components/water/FlowLayout";
import { audit } from "@/src/lib/api";
import type { AuditReport } from "@/src/lib/types";

type Status = "idle" | "diving" | "done" | "error";

export default function AuditPage() {
  const [query,  setQuery]  = useState("");
  const [status, setStatus] = useState<Status>("idle");
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center py-16"
          >
            <VortexSpinner size={100} label="Diving deep…" />
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
                    <GlassPanel key={i} glow="toxic" className="p-6 space-y-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-toxic/80">
                        Conflict on "{c.term}"
                      </p>
                      {/* Side-by-side diff */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="glass-elevated rounded-xl p-4 space-y-2">
                          <p className="text-[11px] font-semibold text-foam/35 truncate">{c.source_a}</p>
                          <p className="text-sm text-foam/80 leading-relaxed">"{c.snippet_a}"</p>
                        </div>
                        <div className="glass-elevated rounded-xl p-4 space-y-2">
                          <p className="text-[11px] font-semibold text-foam/35 truncate">{c.source_b}</p>
                          <p className="text-sm text-foam/80 leading-relaxed">"{c.snippet_b}"</p>
                        </div>
                      </div>
                    </GlassPanel>
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
                  <p className="text-foam/45 text-sm mt-0.5">No contradictions found for "{report.query}".</p>
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
                            "{s}"
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
