// ── Pollution / Ingest ───────────────────────────────────────────────────────

export type PollutionSeverity = "Clean" | "Murky" | "Toxic";

export interface PollutionMatch {
  pattern_type: string; // e.g. "SSN", "Email", "API_Key"
  snippet: string;      // redacted excerpt
  char_offset: number;
}

export interface PollutionReport {
  matches: PollutionMatch[];
  severity: PollutionSeverity;
}

export interface IngestResponse {
  report: PollutionReport;
  forwarded: boolean;     // true = document reached Human Delta
  document_id?: string;
  index_id?: string;
}

// ── Audit ────────────────────────────────────────────────────────────────────

export interface DocCluster {
  source: string;
  snippets: string[];
}

export interface Contradiction {
  term: string;
  source_a: string;
  source_b: string;
  snippet_a: string;
  snippet_b: string;
}

export interface AuditReport {
  query: string;
  clusters: DocCluster[];
  contradictions: Contradiction[];
}

// ── Search ───────────────────────────────────────────────────────────────────

export type ClarityLabel = "crystal" | "clear" | "murky" | "toxic";

export interface SearchResultItem {
  content: string;
  source: string;
  similarity: number;     // 0–1
  clarity_score: number;  // 0–100
  clarity_label: ClarityLabel;
}

export interface SearchResponse {
  results: SearchResultItem[];
}
