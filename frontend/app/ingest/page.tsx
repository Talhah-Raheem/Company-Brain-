"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Link2, CloudUpload, FileText, X,
  CheckCircle2, AlertTriangle, Biohazard, ArrowRight,
} from "lucide-react";
import GlassPanel from "@/src/components/water/GlassPanel";
import WaterClarityBadge from "@/src/components/water/WaterClarityBadge";
import RippleButton from "@/src/components/water/RippleButton";
import FlowLayout from "@/src/components/water/FlowLayout";
import { ingestFile, ingestUrl } from "@/src/lib/api";
import type { IngestResponse } from "@/src/lib/types";
import { cn } from "@/src/lib/utils";

type Tab    = "file" | "url";
type Status = "idle" | "scanning" | "done" | "error";

const patternIcons: Record<string, typeof CheckCircle2> = {
  ssn:         Biohazard,
  email:       AlertTriangle,
  credit_card: Biohazard,
  phone:       AlertTriangle,
  api_key:     Biohazard,
  aws_key:     Biohazard,
};

const floodColors = {
  clean: "bg-clarity",
  murky: "bg-murky",
  toxic: "bg-toxic",
};

export default function IngestPage() {
  const [tab,        setTab]        = useState<Tab>("file");
  const [file,       setFile]       = useState<File | null>(null);
  const [url,        setUrl]        = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [status,     setStatus]     = useState<Status>("idle");
  const [result,     setResult]     = useState<IngestResponse | null>(null);
  const [error,      setError]      = useState("");
  const dropRef = useRef<HTMLDivElement>(null);

  const reset = () => {
    setFile(null); setUrl(""); setStatus("idle");
    setResult(null); setError("");
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleSubmit = async () => {
    setStatus("scanning");
    setResult(null);
    setError("");
    try {
      const res = tab === "file" && file
        ? await ingestFile(file)
        : await ingestUrl(url);
      setResult(res);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setStatus("error");
    }
  };

  const canSubmit = status !== "scanning" && (tab === "file" ? !!file : url.trim().length > 5);

  return (
    <div className="max-w-2xl mx-auto space-y-8">

      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foam">Purified Ingestion</h1>
        <p className="mt-2 text-foam/50 text-sm">
          Nothing enters the corpus without passing the pollution scan.
        </p>
      </div>

      {/* ── Tabs ── */}
      <GlassPanel className="p-1 flex gap-1">
        {(["file", "url"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); reset(); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
              tab === t
                ? "bg-flow/15 text-flow border border-flow/25"
                : "text-foam/45 hover:text-foam/75"
            )}
          >
            {t === "file" ? <><Upload className="h-4 w-4" />Upload File</> : <><Link2 className="h-4 w-4" />Crawl URL</>}
          </button>
        ))}
      </GlassPanel>

      {/* ── Input zone ── */}
      <AnimatePresence mode="wait">
        {tab === "file" ? (
          <motion.div
            key="file"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
          >
            {!file ? (
              <div
                ref={dropRef}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-input")?.click()}
                className={cn(
                  "relative rounded-2xl border-2 border-dashed p-14 flex flex-col items-center gap-4 cursor-pointer",
                  "transition-all duration-300",
                  isDragging
                    ? "border-flow bg-flow/8 shadow-[0_0_32px_rgba(56,189,248,0.15)]"
                    : "border-surface/60 hover:border-flow/40 hover:bg-flow/5"
                )}
              >
                <motion.div
                  animate={isDragging ? { scale: 1.15, y: -6 } : { scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-14 h-14 rounded-2xl bg-flow/10 border border-flow/20 flex items-center justify-center text-flow"
                >
                  <CloudUpload className="h-7 w-7" />
                </motion.div>
                <div className="text-center">
                  <p className="text-foam/80 font-semibold">
                    {isDragging ? "Release to drop" : "Drag & drop or click to browse"}
                  </p>
                  <p className="text-foam/35 text-sm mt-1">PDF · CSV · Markdown · Text</p>
                </div>
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.csv,.md,.txt"
                  className="hidden"
                  onChange={e => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
            ) : (
              <GlassPanel glow="flow" className="p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-flow/15 border border-flow/25 flex items-center justify-center text-flow shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foam truncate">{file.name}</p>
                  <p className="text-foam/40 text-xs mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button onClick={reset} className="text-foam/30 hover:text-foam/70 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </GlassPanel>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="url"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
          >
            <GlassPanel className="p-5 flex items-center gap-3">
              <Link2 className="h-5 w-5 text-foam/30 shrink-0" />
              <input
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://docs.yourcompany.com"
                className="flex-1 bg-transparent text-foam placeholder-foam/25 text-sm outline-none"
              />
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Submit ── */}
      <RippleButton
        onClick={handleSubmit}
        disabled={!canSubmit}
        variant="primary"
        className="w-full justify-center py-3 text-base"
      >
        {status === "scanning" ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-4 w-4 border-2 border-flow/40 border-t-flow rounded-full"
            />
            Scanning…
          </>
        ) : (
          <>Scan &amp; Ingest <ArrowRight className="h-4 w-4" /></>
        )}
      </RippleButton>

      {/* ── Error ── */}
      <AnimatePresence>
        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          >
            <GlassPanel glow="toxic" className="p-5">
              <p className="text-toxic text-sm font-medium">{error}</p>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Result ── */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="relative rounded-2xl overflow-hidden">
              {/* Clarity flood — rises from bottom */}
              <motion.div
                initial={{ height: "0%" }}
                animate={{ height: "100%" }}
                transition={{ duration: 1.4, ease: "easeInOut" }}
                style={{ transformOrigin: "bottom" }}
                className={cn(
                  "absolute bottom-0 left-0 right-0 opacity-[0.09] pointer-events-none",
                  floodColors[result.report.severity]
                )}
              />

              <GlassPanel
                glow={result.report.severity === "clean" ? "clarity" : result.report.severity === "murky" ? "murky" : "toxic"}
                className="p-7 space-y-6 bg-transparent border-0 shadow-none"
              >
                {/* Summary row */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-xs font-semibold tracking-widest uppercase text-foam/40 mb-1">Scan Result</p>
                    <WaterClarityBadge severity={result.report.severity} size="lg" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-foam/35 mb-1">Forwarded to corpus</p>
                    <p className={`font-bold text-sm ${result.forwarded ? "text-clarity" : "text-toxic"}`}>
                      {result.forwarded ? "Yes" : "Blocked"}
                    </p>
                  </div>
                </div>

                {/* Matches */}
                {result.report.match_count > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold tracking-widest uppercase text-foam/35">
                      {result.report.match_count} Pollution{result.report.match_count > 1 ? " Signals" : " Signal"} Found
                    </p>
                    <FlowLayout className="space-y-2">
                      {result.report.matches.map((m, i) => {
                        const Icon = patternIcons[m.pattern_type] ?? AlertTriangle;
                        return (
                          <div key={i} className="glass-elevated rounded-xl px-4 py-3 flex items-start gap-3">
                            <Icon className="h-4 w-4 text-murky mt-0.5 shrink-0" />
                            <div>
                              <span className="text-xs font-bold text-murky uppercase tracking-wide">{m.pattern_type.replace(/_/g, " ")}</span>
                              <p className="text-xs text-foam/50 mt-0.5 font-mono">{m.snippet}</p>
                            </div>
                          </div>
                        );
                      })}
                    </FlowLayout>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-clarity text-sm">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    No pollution signals detected — document is clean.
                  </div>
                )}
              </GlassPanel>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
