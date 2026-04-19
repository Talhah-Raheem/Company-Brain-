echo "@always_follow.md" | cat - CLAUDE.md > tmp && mv tmp CLAUDE.md  

# The Safety Diver — CLAUDE.md

> "Knowledge Clarity = Water Clarity"  
> A Knowledge Governance Agent built for the Human Delta sponsor track.  
> Hackathon: 32 hours. Goal: ship a live, demo-able MVP.

---

## 1. Project Identity

**Name:** The Safety Diver  
**Tagline:** The Knowledge Purification Plant for AI Agents  
**Track:** Human Delta — Safety & Orchestration  
**Mission:** Don't just answer questions. Dive beneath the surface. Find PII pollution, secret leaks, and data contradictions before your AI agent drowns in bad knowledge.

---

## 2. Architecture

```
Browser (Next.js :3000)
       │
       ▼
Rust/Axum Backend (:8080)
  ├── Pollution Middleware    ← PII/secret scanner (regex, runs on every ingest)
  ├── Human Delta Client     ← all HD API calls centralized here
  └── Contradiction Detector ← grep-and-diff logic for The Auditor
       │
       ▼
Human Delta API (api.humandelta.ai)
  POST /v1/indexes    → async website crawler
  POST /v1/documents  → upload PDF, CSV, MD, Image
  POST /v1/search     → vector search (cosine similarity)
  POST /v1/fs         → shell-style FS (ls, tree, cat, grep)
```

The Rust backend is the **Safety Valve** — nothing reaches Human Delta without being scanned first.

---

## 3. Directory Structure

```
Company-Brain-/
├── CLAUDE.md
├── .gitignore
├── backend/                        ← Rust/Axum (replaces Python)
│   ├── Cargo.toml
│   ├── .env
│   └── src/
│       ├── main.rs                 ← Axum router setup, CORS, startup
│       ├── api/
│       │   ├── mod.rs
│       │   ├── ingest.rs           ← POST /api/ingest
│       │   ├── audit.rs            ← POST /api/audit
│       │   └── search.rs           ← POST /api/search
│       ├── humandelta/
│       │   ├── mod.rs
│       │   └── client.rs           ← all Human Delta API calls live here
│       ├── pollution/
│       │   ├── mod.rs
│       │   └── scanner.rs          ← pure PII/secret regex functions
│       └── models/
│           └── mod.rs              ← shared request/response types (serde)
└── frontend/                       ← Next.js 15 (existing scaffold)
    ├── app/
    │   ├── page.tsx                ← Landing / Overview
    │   ├── layout.tsx              ← Root layout, nav
    │   ├── ingest/page.tsx         ← Purified Ingestion UI
    │   ├── audit/page.tsx          ← The Auditor / Diver Mode UI
    │   └── search/page.tsx         ← Clarity Dashboard
    ├── src/
    │   ├── components/
    │   │   └── water/              ← All water-theme UI components
    │   │       ├── GlassPanel.tsx
    │   │       ├── WaterClarityBadge.tsx
    │   │       ├── VortexSpinner.tsx
    │   │       ├── RippleButton.tsx
    │   │       └── FlowLayout.tsx
    │   └── lib/
    │       └── api.ts              ← Typed fetch wrappers to Rust backend
    └── tailwind.config.ts
```

---

## 4. Human Delta API Reference

**Base URL:** `https://api.humandelta.ai`  
**Auth:** `Authorization: Bearer $HUMAN_DELTA_API_KEY` on every request  
**Content-Type:** `application/json` (multipart for file uploads)

| Endpoint | Purpose | Notes |
|---|---|---|
| `POST /v1/indexes` | Crawl a website (async) | Returns index ID; poll for status |
| `POST /v1/documents` | Upload a document | Accepts PDF, CSV, Image, Markdown |
| `POST /v1/search` | Vector search over corpus | Returns ranked results with similarity scores |
| `POST /v1/fs` | Shell-style FS access | Commands: `ls`, `tree`, `cat`, `grep` |

**Key Rule:** All calls to Human Delta must go through `src/humandelta/client.rs`. Never call HD directly from route handlers.

---

## 5. Development Phases

> **Ownership key:** 🔵 Backend (teammate) · 🟢 Frontend (Talhah) · ✅ Done

---

### Phase 1 — Rust Backend Scaffold ✅ COMPLETE
> Owner: 🔵 Backend

- [x] Axum + Tokio + Reqwest + Serde + tower-http (CORS) + dotenvy + thiserror in `Cargo.toml`
- [x] Health check `GET /health` returning `{ status, version }`
- [x] CORS wired for `http://localhost:3000`
- [x] `humandelta/client.rs` — typed methods: `crawl_index`, `upload_document`, `search`, `fs`
- [x] `models/mod.rs` — all shared types: Index, Search, Fs, HealthResponse, ApiError
- [x] `HUMAN_DELTA_API_KEY` + `PORT` loaded from `.env`
- [x] API route stubs: `api/ingest.rs`, `api/audit.rs`, `api/search.rs`

---

### Phase 1b — Frontend Foundation ✅ COMPLETE
> Owner: 🟢 Frontend  
> **Do not touch:** `backend/` directory

- [x] `framer-motion` + `lucide-react` installed
- [x] Water theme in `tailwind.config.ts`: 8 colors (`deep`, `current`, `surface`, `flow`, `clarity`, `murky`, `toxic`, `foam`)
- [x] `globals.css`: `.glass`, `.glass-elevated`, `.text-gradient-flow` base classes
- [x] `src/lib/types.ts`: all API response shapes
- [x] `src/lib/api.ts`: typed fetch wrappers — `ingestFile`, `ingestUrl`, `audit`, `search` → pointing at `NEXT_PUBLIC_BACKEND_URL`
- [x] `src/components/NavBar.tsx`: sticky glass nav, animated Waves brand, active-link spring pill
- [x] `src/components/water/GlassPanel.tsx` / `WaterClarityBadge.tsx` / `VortexSpinner.tsx` / `RippleButton.tsx` / `FlowLayout.tsx`
- [x] `app/layout.tsx`: Inter font, deep ocean shell, NavBar
- [x] `app/page.tsx`: atmospheric hero with floating orbs, animated title, 3 feature cards
- [x] `app/ingest/page.tsx`: drag-drop zone + URL tab, clarity flood animation — **wires to `POST /api/ingest`**
- [x] `app/audit/page.tsx`: dive search bar, VortexSpinner, contradiction diff cards — **wires to `POST /api/audit`**
- [x] `app/search/page.tsx`: search bar, glass result cards with clarity score bars — **wires to `POST /api/search`**

---

### Phase 2 — Pollution Middleware ✅ COMPLETE
> Owner: 🔵 Backend

- [x] `pollution/scanner.rs`: regex patterns for SSN, email, credit card, phone, API keys, AWS secrets
- [x] `PollutionReport` + `PollutionMatch` + `Severity` + `PatternType` structs in `models/mod.rs`
- [x] Severity logic: 0 = Clean · 1–2 = Murky · 3+ or any secret key = Toxic
- [x] Smart redaction: SSN keeps last 4, card keeps last 4, secrets show key name only
- [x] Unit tests — 11/11 passing (`cargo test`)

---

### Phase 3 — Purified Ingestion Route ✅ COMPLETE
> Owner: 🔵 Backend + 🟢 Frontend type fixes

- [x] `POST /api/ingest` registered in `main.rs`
- [x] Branches on `Content-Type`: multipart → file path, JSON → URL path
- [x] File path: UTF-8 scan → blocks Toxic, forwards Clean/Murky to HD `/v1/documents`
- [x] URL path: calls HD `/v1/indexes` crawl (no pre-scan — always forward)
- [x] Binary files (PDF/images) skip text scan, forward as-is
- [x] `Severity` serializes as `"Clean"` / `"Murky"` / `"Toxic"` (no serde rename on enum)
- [x] `PatternType` serializes as snake_case: `"ssn"`, `"email"`, `"credit_card"`, `"phone"`, `"api_key"`, `"aws_key"`
- [x] `IngestResponse` + `UrlIngestRequest` added to `models/mod.rs`
- [x] Returns `IngestResponse { report, forwarded, document_id?, index_id? }`
- [x] Frontend types, badge config, flood colors, and icon map all aligned to match

---

### Phase 4 — Audit / Diver Mode Route ✅ COMPLETE
> Owner: 🔵 Backend

- [x] `POST /api/audit` registered in `main.rs`
- [x] Accepts `{ query: String }`, calls HD `/v1/search` (not `/v1/fs` — uploaded docs live in search index only)
- [x] Fixed HD API field names: `cmd` (not `command`), `text` (not `content`) in SearchResult
- [x] Groups results by `page_title` → `Vec<DocCluster>`, filters by score ≥ 0.6
- [x] Contradiction detector: Jaccard word-set similarity < 0.4 = contradiction
- [x] Returns `AuditReport { query, clusters, contradictions }`
- [x] Live tested: "refund policy" → 2 clusters (30-day vs 7-day policy), 1 contradiction detected

---

### Phase 5 — Clarity Dashboard / Search Route ✅ COMPLETE
> Owner: 🔵 Backend + 🟢 Frontend model additions

- [x] `ClarityLabel` enum, `SearchResultItem`, `ApiSearchResponse` added to `models/mod.rs`
- [x] `SearchResult.source` field renamed to `source_url` via `#[serde(rename = "source_url")]`
- [x] `api/search.rs` handler: calls `hd.search()`, maps each hit to `SearchResultItem`
- [x] Clarity scoring: HD score × 100 → 80+ Crystal, 60–79 Clear, 40–59 Murky, <40 Toxic
- [x] `POST /api/search` registered in `main.rs`
- [x] `cargo build` passes — 0 errors, 0 new warnings

---

### Phase 6 — Demo Prep & Final Polish
> Owner: 🔵🟢 Both

- [ ] 🔵 Seed demo data: upload docs with planted PII + contradictions via `/api/ingest`
- [x] 🟢 Error states: "Toxic Water" full-screen overlay for Toxic severity on ingest
- [ ] 🟢 Loading skeletons (wave shimmer) on search results
- [ ] 🔵🟢 End-to-end smoke test: ingest → audit → search full flow
- [ ] 🔵🟢 Verify CORS, env vars, and ports are correct in production build

---

## 6. Water Theme Design System

### Color Palette

```css
--deep:    #0a1628   /* deep ocean — page background */
--current: #0d2b4e   /* mid-water — card/panel background */
--surface: #1a4a7a   /* surface shimmer — borders, dividers */
--flow:    #38bdf8   /* sky-400 — primary accent, links */
--clarity: #06b6d4   /* cyan-500 — clean/safe state */
--murky:   #f59e0b   /* amber-400 — warning, caution */
--toxic:   #ef4444   /* red-500 — danger, PII detected */
--foam:    #e0f2fe   /* sky-100 — text on dark */
```

### Component Patterns

| Component | Description |
|---|---|
| `GlassPanel` | `backdrop-blur-md`, `bg-white/5`, `border border-white/10`, depth shadow |
| `WaterClarityBadge` | Animated pill: flows between cyan/amber/red based on severity |
| `VortexSpinner` | SVG arc spinner, rotates with swirling motion for "diving" state |
| `RippleButton` | Framer Motion scale + radial ripple on click |
| `FlowLayout` | Staggered `AnimatePresence` fade-up for list items |
| `WaveLoader` | Skeleton shimmer using horizontal wave gradient |

### Tailwind Extensions (add to `tailwind.config.ts`)

```ts
extend: {
  colors: {
    deep: '#0a1628',
    current: '#0d2b4e',
    surface: '#1a4a7a',
    flow: '#38bdf8',
    clarity: '#06b6d4',
    murky: '#f59e0b',
    toxic: '#ef4444',
    foam: '#e0f2fe',
  },
  animation: {
    vortex: 'spin 2s linear infinite',
    ripple: 'ripple 0.6s ease-out',
    'wave-shimmer': 'wave 1.5s ease-in-out infinite',
  }
}
```

### Glassmorphism Base Class

```css
.glass {
  background: rgba(13, 43, 78, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(56, 189, 248, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.05);
}
```

---

## 7. Coding Conventions

### Rust
- Module structure: `api/`, `humandelta/`, `pollution/`, `models/`
- Error handling: `thiserror` crate for custom error types; propagate with `?`; convert to `axum::Json` error response at handler boundary
- No HD calls outside `humandelta/client.rs`
- `pollution/scanner.rs` must be pure functions — no I/O, no async
- Use `#[derive(Debug, Serialize, Deserialize)]` on all models
- Log with `tracing` crate; structured fields preferred

### Next.js / TypeScript
- All backend calls go through `src/lib/api.ts` — typed fetch wrappers only
- Water theme components live in `src/components/water/` — keep them generic and reusable
- Use `lucide-react` for all icons — no other icon libraries
- Framer Motion for all animations — no CSS `@keyframes` animation hacks
- Strongly type all API response shapes in `src/lib/types.ts`

---

## 8. Environment Variables

### Backend (`backend/.env`)
```
HUMAN_DELTA_API_KEY=<your key>
HUMAN_DELTA_BASE_URL=https://api.humandelta.ai
PORT=8080
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

---

## 9. Run Commands

```bash
# Start Rust backend (from /backend)
cargo run

# Start Next.js frontend (from /frontend)
npm run dev

# Run backend tests
cargo test

# Build for production
cargo build --release
npm run build
```

---

## 10. The Three Core Features (MVP Demo Flow)

1. **Purified Ingestion** (`/ingest`)  
   Upload a doc or crawl a URL → watch the water clarity scan → see what pollution was found → clean data enters the corpus

2. **The Auditor — Diver Mode** (`/audit`)  
   Type a term (e.g. "Refund Policy") → the diver goes deep → contradictions surface as a vortex → side-by-side diff shows the conflict

3. **Clarity Dashboard** (`/search`)  
   Search your knowledge base → results come back with a Water Clarity Score — know exactly how trustworthy each source is before you use it

---

## 11. Key Constraints

- **32-hour clock** — ship features in phase order; skip polish if behind
- **No AI model calls** — Human Delta is the intelligence layer; the Rust backend is logic only
- **Safety First** — every document must pass through `pollution/scanner.rs` before reaching HD
- **Demo-friendly** — always have pre-seeded demo data with planted PII + contradictions ready to show
