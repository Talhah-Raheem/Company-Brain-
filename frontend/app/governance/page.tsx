"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X, Scale, ArrowRight, Trash2 } from "lucide-react";
import GlassPanel from "@/src/components/water/GlassPanel";
import FlowLayout from "@/src/components/water/FlowLayout";
import RippleButton from "@/src/components/water/RippleButton";
import WaveLoader from "@/src/components/water/WaveLoader";
import { getGovernance, deleteGovernance } from "@/src/lib/api";
import type { GovernanceEntry } from "@/src/lib/types";

type Status = "loading" | "done" | "error";

function SkeletonCard({ delay = 0 }: { delay?: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-current/40 p-6 space-y-4">
      <WaveLoader width="w-1/3" delay={delay} />
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-surface/20 p-4 space-y-2">
          <WaveLoader variant="clarity" width="w-1/2" delay={delay + 0.1} />
          <WaveLoader variant="clarity" delay={delay + 0.15} />
        </div>
        <div className="rounded-xl bg-surface/20 p-4 space-y-2">
          <WaveLoader width="w-1/2" delay={delay + 0.2} />
          <WaveLoader delay={delay + 0.25} />
        </div>
      </div>
    </div>
  );
}

function EntryCard({ entry, onDelete, isDeleting }: { entry: GovernanceEntry; onDelete: () => void; isDeleting: boolean }) {
  return (
    <GlassPanel glow="clarity" className="p-6 space-y-5">
      <div className="flex items-center gap-2">
        <Scale className="h-4 w-4 text-flow/70" />
        <h3 className="text-lg font-bold tracking-tight text-foam">{entry.term}</h3>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="ml-auto p-1.5 rounded-lg hover:bg-toxic/10 text-foam/20 hover:text-toxic transition-colors disabled:opacity-40"
          title="Delete declaration"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="glass-elevated rounded-xl p-4 space-y-2 ring-1 ring-clarity/30">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-clarity" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-clarity">Canonical</span>
          </div>
          <p className="text-sm font-semibold text-foam/90 break-words">{entry.canonical}</p>
        </div>

        <div className="glass-elevated rounded-xl p-4 space-y-2 opacity-60">
          <div className="flex items-center gap-2">
            <X className="h-4 w-4 text-foam/40" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-foam/40">Rejected</span>
          </div>
          <p className="text-sm text-foam/50 line-through break-words">{entry.rejected}</p>
        </div>
      </div>
    </GlassPanel>
  );
}

export default function GovernancePage() {
  const [status,       setStatus]       = useState<Status>("loading");
  const [entries,      setEntries]      = useState<GovernanceEntry[]>([]);
  const [error,        setError]        = useState("");
  const [deletingTerm, setDeletingTerm] = useState<string | null>(null);

  const handleDelete = async (term: string) => {
    setDeletingTerm(term);
    try {
      await deleteGovernance(term);
      setEntries(prev => prev.filter(e => e.term !== term));
    } finally {
      setDeletingTerm(null);
    }
  };

  useEffect(() => {
    getGovernance()
      .then(r => { setEntries(r.entries); setStatus("done"); })
      .catch(e => { setError(e instanceof Error ? e.message : "Unknown error"); setStatus("error"); });
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-10">

      {/* ── Header ── */}
      <div className="space-y-5">
        <div className="inline-flex items-center gap-2 eyebrow text-clarity/85 border border-clarity/25 rounded-full px-3.5 py-1 glass">
          <Scale className="h-3 w-3" />
          <span>IV · Governance</span>
        </div>
        <h1 className="font-display font-normal text-5xl md:text-6xl leading-[0.98] tracking-tight text-foam">
          Governance <span className="italic text-gradient-flow">Log</span>
        </h1>
        <p className="font-display italic text-lg text-foam/55 max-w-xl leading-relaxed">
          The source of truth for every AI agent reading your corpus.
        </p>
        <p className="text-xs text-foam/35">
          Declarations written to <span className="font-mono text-flow/70">/agent/canonical-sources.md</span>
        </p>
      </div>

      {/* ── Loading ── */}
      <AnimatePresence>
        {status === "loading" && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {[0, 1, 2].map(i => <SkeletonCard key={i} delay={i * 0.1} />)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error ── */}
      {status === "error" && (
        <GlassPanel glow="toxic" className="p-5">
          <p className="text-toxic text-sm font-medium">{error}</p>
        </GlassPanel>
      )}

      {/* ── Entries ── */}
      {status === "done" && (
        <>
          {entries.length > 0 ? (
            <>
              <p className="text-xs font-semibold tracking-widest uppercase text-foam/30">
                {entries.length} Canonical Declaration{entries.length !== 1 ? "s" : ""}
              </p>
              <FlowLayout className="space-y-4">
                {entries.map((e, i) => (
                  <EntryCard key={i} entry={e} onDelete={() => handleDelete(e.term)} isDeleting={deletingTerm === e.term} />
                ))}
              </FlowLayout>
            </>
          ) : (
            <GlassPanel className="p-10 text-center space-y-5">
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-full bg-flow/10 border border-flow/25 flex items-center justify-center">
                  <Scale className="h-7 w-7 text-flow/70" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-foam">No canonical sources yet</p>
                <p className="text-foam/45 text-sm max-w-md mx-auto">
                  Resolve a contradiction in Diver Mode to declare which source your AI agents should trust.
                </p>
              </div>
              <Link href="/audit" className="inline-block">
                <RippleButton variant="primary">
                  Go to Diver Mode <ArrowRight className="h-4 w-4" />
                </RippleButton>
              </Link>
            </GlassPanel>
          )}
        </>
      )}
    </div>
  );
}
