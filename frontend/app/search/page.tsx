"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ExternalLink, Droplets, AlertTriangle, Biohazard, Sparkles, FileText, ShieldCheck, ShieldAlert, LayoutDashboard } from "lucide-react";
import GlassPanel from "@/src/components/water/GlassPanel";
import WaterClarityBadge from "@/src/components/water/WaterClarityBadge";
import RippleButton from "@/src/components/water/RippleButton";
import FlowLayout from "@/src/components/water/FlowLayout";
import WaveLoader from "@/src/components/water/WaveLoader";
import CoralDivider from "@/src/components/water/CoralDivider";
import { search, listFiles } from "@/src/lib/api";
import type { SearchResultItem, ClarityLabel, PollutionSeverity, FileEntry, GovernanceTag } from "@/src/lib/types";

type Status = "idle" | "searching" | "done" | "error";

const clarityToSeverity: Record<ClarityLabel, PollutionSeverity> = {
  crystal: "Clean",
  clear:   "Clean",
  murky:   "Murky",
  toxic:   "Toxic",
};

const clarityBarColor: Record<ClarityLabel, string> = {
  crystal: "bg-clarity",
  clear:   "bg-clarity/70",
  murky:   "bg-murky",
  toxic:   "bg-toxic",
};

const clarityIcons = {
  crystal: Droplets,
  clear:   Droplets,
  murky:   AlertTriangle,
  toxic:   Biohazard,
};

function SkeletonCard({ delay = 0 }: { delay?: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-current/40 p-6 space-y-4 overflow-hidden">
      <WaveLoader width="w-3/4" delay={delay} />
      <WaveLoader width="w-full" delay={delay + 0.1} />
      <WaveLoader width="w-2/3" delay={delay + 0.2} />
      <div className="h-1.5 rounded-full bg-surface/40 w-full mt-2" />
    </div>
  );
}

function ScoreBar({ score, label }: { score: number; label: ClarityLabel }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full bg-surface/50 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${clarityBarColor[label]}`}
        />
      </div>
      <span className="text-xs font-bold text-foam/50 tabular-nums w-9 text-right">{score}</span>
    </div>
  );
}

function GovernanceBadge({ tag }: { tag: GovernanceTag }) {
  if (tag.status === "canonical") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-clarity/15 border border-clarity/30 text-clarity text-[11px] font-semibold tracking-wide">
        <ShieldCheck className="h-3 w-3" />
        Canonical for &ldquo;{tag.term}&rdquo;
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-toxic/10 border border-toxic/25 text-toxic/85 text-[11px] font-semibold tracking-wide">
      <ShieldAlert className="h-3 w-3" />
      Rejected — superseded for &ldquo;{tag.term}&rdquo;
    </div>
  );
}

function ResultCard({ item }: { item: SearchResultItem }) {
  const Icon = clarityIcons[item.clarity_label];
  const glow = item.clarity_label === "toxic" ? "toxic" :
               item.clarity_label === "murky" ? "murky" : "clarity";

  const isCanonical = item.governance?.status === "canonical";
  const isRejected  = item.governance?.status === "rejected";

  const panel = (
    <GlassPanel
      glow={glow as "toxic" | "murky" | "clarity"}
      className={`p-6 space-y-4 ${isCanonical ? "ring-1 ring-clarity/40" : ""}`}
    >
      {item.governance && <GovernanceBadge tag={item.governance} />}

      <p className="text-sm text-foam/80 leading-relaxed line-clamp-3">{item.content}</p>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-foam/35 min-w-0">
          <ExternalLink className="h-3 w-3 shrink-0" />
          <span className="truncate">{item.source || "unknown"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-foam/35 shrink-0">
          <Sparkles className="h-3 w-3" />
          {(item.similarity * 100).toFixed(1)}% match
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foam/40">
            <Icon className="h-3 w-3" />
            Water Clarity Score
          </div>
          <WaterClarityBadge severity={clarityToSeverity[item.clarity_label]} size="sm" />
        </div>
        <ScoreBar score={item.clarity_score} label={item.clarity_label} />
      </div>
    </GlassPanel>
  );

  return isRejected ? <div className="opacity-60">{panel}</div> : panel;
}

function FilesPanel({ files }: { files: FileEntry[] }) {
  if (files.length === 0) return null;
  return (
    <GlassPanel className="p-5 space-y-3">
      <div className="flex flex-wrap gap-2">
        {files.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface/40 border border-white/10 text-xs text-foam/60"
          >
            <FileText className="h-3 w-3 text-flow/60" />
            {f.name}
          </motion.div>
        ))}
      </div>
    </GlassPanel>
  );
}

export default function SearchPage() {
  const [query,   setQuery]   = useState("");
  const [status,  setStatus]  = useState<Status>("idle");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [error,   setError]   = useState("");
  const [files,   setFiles]   = useState<FileEntry[]>([]);

  useEffect(() => {
    listFiles().then(r => setFiles(r.files)).catch(() => {});
  }, []);

  const run = async () => {
    if (!query.trim()) return;
    setStatus("searching");
    setResults([]);
    setError("");
    try {
      const res = await search(query.trim());
      setResults(res.results);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setStatus("error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10">

      {/* ── Header ── */}
      <div className="space-y-5">
        <div className="inline-flex items-center gap-2 eyebrow text-murky/85 border border-murky/25 rounded-full px-3.5 py-1 glass">
          <LayoutDashboard className="h-3 w-3" />
          <span>III · Clarity</span>
        </div>
        <h1 className="font-display font-normal text-5xl md:text-6xl leading-[0.98] tracking-tight text-foam">
          Clarity <span className="italic text-gradient-flow">Dashboard</span>
        </h1>
        <p className="font-display italic text-lg text-foam/55 max-w-xl leading-relaxed">
          Every result carries a Water Clarity Score — trust before you consume.
        </p>
      </div>

      <CoralDivider label="Knowledge Base" />

      {/* ── Indexed files ── */}
      <FilesPanel files={files} />

      {/* ── Search bar ── */}
      <GlassPanel glow="clarity" className="p-2 flex items-center gap-3">
        <Search className="ml-3 h-5 w-5 text-foam/30 shrink-0" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && run()}
          placeholder="Search your knowledge base…"
          className="flex-1 bg-transparent text-foam placeholder-foam/25 text-sm outline-none py-3"
        />
        <RippleButton
          onClick={run}
          disabled={status === "searching" || !query.trim()}
          variant="primary"
          className="shrink-0"
        >
          {status === "searching" ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-4 w-4 border-2 border-flow/40 border-t-flow rounded-full"
            />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Search
        </RippleButton>
      </GlassPanel>

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

      {/* ── Skeletons ── */}
      <AnimatePresence>
        {status === "searching" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {[0, 1, 2].map(i => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <SkeletonCard delay={i * 0.12} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results ── */}
      <AnimatePresence>
        {status === "done" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <p className="text-xs font-semibold tracking-widest uppercase text-foam/30">
              {results.length} result{results.length !== 1 ? "s" : ""} for &quot;{query}&quot;
            </p>

            {results.length > 0 ? (
              <FlowLayout className="space-y-4">
                {results.map((item, i) => (
                  <ResultCard key={i} item={item} />
                ))}
              </FlowLayout>
            ) : (
              <GlassPanel className="p-8 text-center">
                <p className="text-foam/40 text-sm">No results found. Try ingesting some documents first.</p>
              </GlassPanel>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
