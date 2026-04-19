// ── Pollution / Ingest ───────────────────────────────────────────────────────

// Matches Rust Severity enum (no serde rename — serializes as variant names)
export type PollutionSeverity = "Clean" | "Murky" | "Toxic";

// Matches Rust: #[serde(rename_all = "snake_case")] on PatternType enum
export type PatternType =
  | "ssn"
  | "email"
  | "credit_card"
  | "phone"
  | "api_key"
  | "aws_key";

export interface PollutionMatch {
  pattern_type: PatternType;
  snippet: string;       // already redacted by backend
  char_offset: number;
}

export interface PollutionReport {
  matches: PollutionMatch[];
  severity: PollutionSeverity;
  match_count: number;   // backend includes this as a convenience field
}

export interface IngestResponse {
  report: PollutionReport;
  forwarded: boolean;
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
  similarity: number;     // 0–1, from HD score field
  clarity_score: number;  // 0–100, computed by backend
  clarity_label: ClarityLabel;
}

export interface SearchResponse {
  results: SearchResultItem[];
}

// ── Files ─────────────────────────────────────────────────────────────────────

export interface FileEntry {
  name: string;
  path: string;
}

export interface FilesResponse {
  files: FileEntry[];
}

export interface FileContentResponse {
  path: string;
  content: string;
}
