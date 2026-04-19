import type { IngestResponse, AuditReport, SearchResponse, FilesResponse, FileContentResponse, ResolveRequest, ResolveResponse, GovernanceResponse } from "./types";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text().catch(() => "Request failed")}`);
  return res.json();
}

async function postForm<T>(path: string, form: FormData): Promise<T> {
  // No Content-Type header — browser sets it with the multipart boundary
  const res = await fetch(`${BASE}${path}`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text().catch(() => "Request failed")}`);
  return res.json();
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status}: ${await res.text().catch(() => "Request failed")}`);
  return res.json();
}

export const ingestFile = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return postForm<IngestResponse>("/api/ingest", form);
};

export const ingestUrl  = (url: string)              => postJson<IngestResponse>("/api/ingest", { url });
export const audit      = (query: string)             => postJson<AuditReport>("/api/audit", { query });
export const search     = (query: string, limit = 10) => postJson<SearchResponse>("/api/search", { query, limit });
export const listFiles      = ()                        => getJson<FilesResponse>("/api/files");
export const resolve        = (req: ResolveRequest)     => postJson<ResolveResponse>("/api/audit/resolve", req);
export const getFileContent = (path: string) => getJson<FileContentResponse>(`/api/files/content?path=${encodeURIComponent(path)}`);
export const getGovernance  = ()              => getJson<GovernanceResponse>("/api/governance");
