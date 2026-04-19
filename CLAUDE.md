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

### Phase 1 — Rust Backend Scaffold (Hours 0–4)
- [ ] Remove Python backend files (`backend/main.py`, `backend/config.py`)
- [ ] `cargo init backend` with: `axum`, `tokio` (full), `reqwest` (json), `serde`, `serde_json`, `tower-http` (cors), `dotenvy`, `thiserror`
- [ ] Implement health check `GET /health`
- [ ] Wire CORS for `http://localhost:3000`
- [ ] Build `humandelta/client.rs` with typed methods for all 4 HD endpoints
- [ ] Load `HUMAN_DELTA_API_KEY` from `.env`

### Phase 2 — Pollution Middleware (Hours 4–8)
- [ ] `pollution/scanner.rs`: regex patterns for SSN, email, credit card, phone, API keys, AWS secrets
- [ ] `PollutionReport` model: `{ matches: Vec<PollutionMatch>, severity: Clean | Murky | Toxic }`
- [ ] `PollutionMatch`: `{ pattern_type, snippet, char_offset }`
- [ ] Severity logic: 0 matches = Clean, 1–2 = Murky, 3+ or secret key = Toxic
- [ ] Unit test the scanner with known PII strings

### Phase 3 — Purified Ingestion (Hours 8–14)
- [ ] Backend: `POST /api/ingest` — scan content → return report → conditionally forward to HD `/v1/documents`
- [ ] Support: file upload (PDF, CSV, MD), URL crawl trigger (`/v1/indexes`)
- [ ] Frontend: drag-and-drop upload zone + URL input field
- [ ] Water clarity animation on scan completion (color flood: blue → amber → red)
- [ ] Show `PollutionReport` breakdown with redacted snippet previews

### Phase 4 — The Auditor / Diver Mode (Hours 14–22)
- [ ] Backend: `POST /api/audit` with `{ query: string }` param
- [ ] Call HD `/v1/fs` with `grep` command for the query term
- [ ] Cluster grep results by source document
- [ ] Contradiction detection: compare sentences containing the term across docs, flag divergence
- [ ] Return `AuditReport { query, clusters: Vec<DocCluster>, contradictions: Vec<Contradiction> }`
- [ ] Frontend: search bar for audit query
- [ ] "Vortex" spinner while diving
- [ ] Contradiction cards with side-by-side diff (source A vs source B)
- [ ] "The Vortex" swirl visualization for high-contradiction results

### Phase 5 — Clarity Dashboard / Search (Hours 22–28)
- [ ] Backend: `POST /api/search` → proxy to HD `/v1/search`, attach clarity score
- [ ] Clarity score = weighted combo of: source age (fresher = better) + contradiction flag from audit cache
- [ ] Return `SearchResult { content, source, similarity, clarity_score, clarity_label }`
- [ ] Frontend: search bar on `/search` page
- [ ] Results rendered as glass cards with water clarity badge
- [ ] Clicking a result shows full source doc + audit link

### Phase 6 — Polish & Demo Prep (Hours 28–32)
- [ ] Full glassmorphism pass: `backdrop-blur`, translucent borders, layered depth
- [ ] Framer Motion: page transitions (wave wipe), staggered list entries, ripple on button click
- [ ] Loading skeletons (wave shimmer)
- [ ] Error states: "Toxic Water" full-screen overlay for severe pollution
- [ ] Demo data: pre-loaded docs with planted PII and contradictions for live demo
- [ ] Landing page: animated hero with floating glass panels, project explanation

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
